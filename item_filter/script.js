const CONFIG_PATH = "./config.json";
const FALLBACK_ICON =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='#e7eef5'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='#5b7288' font-family='sans-serif' font-size='20'>NO ICON</text></svg>"
  );

const DEFAULT_CONFIG = {
  dbPath: "../resources/items_db.json",
  iconBase: "../resources/images",
  filterOptionOrder: {
    heroes: [],
    tiers: ["青铜", "白银", "黄金", "钻石", "传奇"],
    sizes: ["小型", "中型", "大型"],
    sorts: ["name", "damage", "heal", "shield"],
    tags: [],
  },
  sortOptionLabels: {
    name: "名称",
    damage: "伤害高到低",
    heal: "治疗高到低",
    shield: "护盾高到低",
  },
  cardIcon: {
    baseHeight: 72,
    widthMultiplier: {
      Small: 0.5,
      Medium: 1,
      Large: 1.5,
    },
  },
  cardDisplay: {
    metaFields: ["hero", "size", "tier"],
    statFields: ["damage", "heal", "shield"],
    showTags: true,
    tagLimit: 8,
  },
  translation: {
    enabled: true,
    fieldLabels: {},
    exact: {},
  },
};

const state = {
  items: [],
  filtered: [],
  selectedTags: new Set(),
  config: DEFAULT_CONFIG,
};

const el = {
  summary: document.getElementById("summary"),
  cards: document.getElementById("cards"),
  template: document.getElementById("cardTemplate"),
  keyword: document.getElementById("keyword"),
  hero: document.getElementById("hero"),
  size: document.getElementById("size"),
  tier: document.getElementById("tier"),
  sort: document.getElementById("sort"),
  tagList: document.getElementById("tagList"),
  clearTags: document.getElementById("clearTags"),
};

function safeStr(v) {
  return (v ?? "").toString().trim();
}

function splitLang(v) {
  const parts = safeStr(v)
    .split("/")
    .map((x) => x.trim())
    .filter(Boolean);
  return {
    en: parts[0] || "",
    cn: parts[1] || "",
  };
}

function cnFirst(v) {
  const p = splitLang(v);
  return p.cn || p.en;
}

function cnOnly(v) {
  const p = splitLang(v);
  return p.cn || p.en;
}

function enFirst(v) {
  const p = splitLang(v);
  return p.en || p.cn;
}

function parseTokens(v) {
  const s = safeStr(v);
  if (!s) return [];
  return s
    .split("|")
    .map((x) => cnOnly(x))
    .map((x) => translateText(x))
    .map((x) => x.trim())
    .filter(Boolean);
}

function translateExactToken(token) {
  const t = safeStr(token);
  if (!t) return "";
  const translation = state.config.translation || {};
  if (!translation.enabled) return t;
  const exact = translation.exact || {};
  if (exact[t]) return exact[t];
  const lower = t.toLowerCase();
  for (const [k, v] of Object.entries(exact)) {
    if (k.toLowerCase() === lower) return v;
  }
  return t;
}

function translateText(value) {
  const s = safeStr(value);
  if (!s) return "";

  const direct = translateExactToken(s);
  if (direct !== s) return direct;

  if (s.includes("|")) {
    return s
      .split("|")
      .map((x) => translateExactToken(x))
      .join(" | ");
  }
  if (s.includes("/")) {
    return s
      .split("/")
      .map((x) => translateExactToken(x))
      .join("/");
  }
  if (s.includes(",")) {
    return s
      .split(",")
      .map((x) => translateExactToken(x))
      .join(", ");
  }

  return direct;
}

function getFieldLabel(key) {
  const k = safeStr(key);
  if (!k) return "";
  const labels = (state.config.translation && state.config.translation.fieldLabels) || {};
  return labels[k] || translateText(k);
}

function mergeConfig(userConfig = {}) {
  state.config = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    filterOptionOrder: {
      ...DEFAULT_CONFIG.filterOptionOrder,
      ...(userConfig.filterOptionOrder || {}),
    },
    sortOptionLabels: {
      ...DEFAULT_CONFIG.sortOptionLabels,
      ...(userConfig.sortOptionLabels || {}),
    },
    cardIcon: {
      ...DEFAULT_CONFIG.cardIcon,
      ...(userConfig.cardIcon || {}),
      widthMultiplier: {
        ...DEFAULT_CONFIG.cardIcon.widthMultiplier,
        ...((userConfig.cardIcon && userConfig.cardIcon.widthMultiplier) || {}),
      },
    },
    cardDisplay: {
      ...DEFAULT_CONFIG.cardDisplay,
      ...(userConfig.cardDisplay || {}),
    },
    translation: {
      ...DEFAULT_CONFIG.translation,
      ...(userConfig.translation || {}),
      fieldLabels: {
        ...DEFAULT_CONFIG.translation.fieldLabels,
        ...((userConfig.translation && userConfig.translation.fieldLabels) || {}),
      },
      exact: {
        ...DEFAULT_CONFIG.translation.exact,
        ...((userConfig.translation && userConfig.translation.exact) || {}),
      },
    },
  };
}

function getMetaToken(item, key) {
  const map = {
    hero: item._heroDisplay ? `英雄: ${item._heroDisplay}` : "",
    size: item._sizeDisplay ? `尺寸: ${item._sizeDisplay}` : "",
    tier: item._tierDisplay ? `起始品质: ${item._tierDisplay}` : "",
  };
  if (map[key]) return map[key];
  const raw = safeStr(item[key]);
  return raw ? `${getFieldLabel(key)}: ${translateText(raw)}` : "";
}

function getStatToken(item, key) {
  const map = {
    damage: `伤害 ${item._damage}`,
    heal: `治疗 ${item._heal}`,
    shield: `护盾 ${item._shield}`,
    burn: `灼烧 ${toNum(item.burn)}`,
    poison: `剧毒 ${toNum(item.poison)}`,
    crit: `暴击 ${toNum(item.crit)}`,
    cooldown: `冷却 ${toNum(item.cooldown)}`,
  };
  if (map[key]) return map[key];
  const raw = safeStr(item[key]);
  return raw ? `${getFieldLabel(key)}: ${translateText(raw)}` : "";
}

function sortByCustomOrder(values, orderList = []) {
  const orderMap = new Map(orderList.map((v, i) => [v, i]));
  return [...values].sort((a, b) => {
    const ai = orderMap.has(a) ? orderMap.get(a) : Number.MAX_SAFE_INTEGER;
    const bi = orderMap.has(b) ? orderMap.get(b) : Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return a.localeCompare(b, "zh-Hans-CN");
  });
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeItem(item) {
  const tags = [...parseTokens(item.tags), ...parseTokens(item.hidden_tags)];
  return {
    ...item,
    _nameCn: safeStr(item.name_cn),
    _nameEn: safeStr(item.name_en),
    _heroDisplay: translateText(cnFirst(item.heroes)),
    _sizeKey: enFirst(item.size),
    _sizeDisplay: translateText(cnFirst(item.size)),
    _tierDisplay: translateText(cnFirst(item.starting_tier)),
    _tags: Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b)),
    _damage: toNum(item.damage),
    _heal: toNum(item.heal),
    _shield: toNum(item.shield),
    _icon: `${state.config.iconBase}/${item.id}.webp`,
  };
}

function setSelectOptions(select, values) {
  select.innerHTML = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = "全部";
  select.appendChild(all);
  values.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = translateText(v);
    select.appendChild(opt);
  });
}

function buildSortOptions() {
  const labels = state.config.sortOptionLabels;
  const selected = labels[el.sort.value] ? el.sort.value : "name";
  const keys = sortByCustomOrder(
    Object.keys(labels),
    state.config.filterOptionOrder.sorts || []
  );
  el.sort.innerHTML = "";
  keys.forEach((key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = translateText(labels[key]);
    el.sort.appendChild(opt);
  });
  el.sort.value = labels[selected] ? selected : keys[0];
}

function buildControls() {
  const heroes = sortByCustomOrder(
    [...new Set(state.items.map((x) => x._heroDisplay).filter(Boolean))],
    state.config.filterOptionOrder.heroes || []
  );
  const sizes = sortByCustomOrder(
    [...new Set(state.items.map((x) => x._sizeDisplay).filter(Boolean))],
    state.config.filterOptionOrder.sizes || []
  );
  const tiers = sortByCustomOrder(
    [...new Set(state.items.map((x) => x._tierDisplay).filter(Boolean))],
    state.config.filterOptionOrder.tiers || []
  );
  const tags = sortByCustomOrder(
    [...new Set(state.items.flatMap((x) => x._tags))],
    state.config.filterOptionOrder.tags || []
  );

  setSelectOptions(el.hero, heroes);
  setSelectOptions(el.size, sizes);
  setSelectOptions(el.tier, tiers);
  buildSortOptions();

  el.tagList.innerHTML = "";
  tags.forEach((tag) => {
    const label = document.createElement("label");
    label.className = "tag-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = tag;
    checkbox.style.width = "auto";
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) state.selectedTags.add(tag);
      else state.selectedTags.delete(tag);
      applyFilters();
    });
    const text = document.createElement("span");
    text.textContent = translateText(tag);
    label.appendChild(checkbox);
    label.appendChild(text);
    el.tagList.appendChild(label);
  });
}

function matchItem(item) {
  const keyword = safeStr(el.keyword.value).toLowerCase();
  if (keyword) {
    const haystack = [
      item._nameCn,
      item._nameEn,
      safeStr(item.skills?.map((x) => `${x.en} ${x.cn}`).join(" ")),
      safeStr(item.skills_passive?.map((x) => `${x.en} ${x.cn}`).join(" ")),
      item._tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(keyword)) return false;
  }

  if (el.hero.value && item._heroDisplay !== el.hero.value) return false;
  if (el.size.value && item._sizeDisplay !== el.size.value) return false;
  if (el.tier.value && item._tierDisplay !== el.tier.value) return false;

  if (state.selectedTags.size > 0) {
    for (const tag of state.selectedTags) {
      if (!item._tags.includes(tag)) return false;
    }
  }
  return true;
}

function applySort(items) {
  const out = [...items];
  switch (el.sort.value) {
    case "damage":
      out.sort((a, b) => b._damage - a._damage || a._nameEn.localeCompare(b._nameEn));
      break;
    case "heal":
      out.sort((a, b) => b._heal - a._heal || a._nameEn.localeCompare(b._nameEn));
      break;
    case "shield":
      out.sort((a, b) => b._shield - a._shield || a._nameEn.localeCompare(b._nameEn));
      break;
    default:
      out.sort((a, b) => (a._nameCn || a._nameEn).localeCompare(b._nameCn || b._nameEn));
  }
  return out;
}

function renderCards() {
  el.cards.innerHTML = "";
  const frag = document.createDocumentFragment();

  state.filtered.forEach((item) => {
    const node = el.template.content.firstElementChild.cloneNode(true);
    const baseIconHeight = Number(state.config.cardIcon.baseHeight) || 72;
    const iconWidthMultiplier = state.config.cardIcon.widthMultiplier || {};
    const width = baseIconHeight * (iconWidthMultiplier[item._sizeKey] || 1);
    node.style.setProperty("--icon-width", `${width}px`);
    node.style.setProperty("--icon-height", `${baseIconHeight}px`);

    const icon = node.querySelector(".icon");
    icon.src = item._icon;
    icon.loading = "lazy";
    icon.onerror = () => {
      icon.src = FALLBACK_ICON;
    };

    node.querySelector(".name-cn").textContent =
      item._nameCn || translateText(item._nameEn) || "(未命名)";
    node.querySelector(".name-en").textContent = item._nameCn ? "" : translateText(item._nameEn);
    const metaFields = state.config.cardDisplay.metaFields || [];
    const statFields = state.config.cardDisplay.statFields || [];
    const metaText = metaFields.map((k) => getMetaToken(item, k)).filter(Boolean).join(" | ");
    const statText = statFields.map((k) => getStatToken(item, k)).filter(Boolean).join(" | ");

    node.querySelector(".meta").textContent = metaText;
    node.querySelector(".stats").textContent = statText;

    const chips = node.querySelector(".chips");
    if (state.config.cardDisplay.showTags) {
      const limit = Number(state.config.cardDisplay.tagLimit) || 8;
      item._tags.slice(0, limit).forEach((tag) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = tag;
        chips.appendChild(chip);
      });
    }

    frag.appendChild(node);
  });

  el.cards.appendChild(frag);
  el.summary.textContent = `共 ${state.items.length} 个物品，当前匹配 ${state.filtered.length} 个`;
}

function applyFilters() {
  const filtered = state.items.filter(matchItem);
  state.filtered = applySort(filtered);
  renderCards();
}

function bindEvents() {
  [el.keyword].forEach((x) => {
    x.addEventListener("input", applyFilters);
    x.addEventListener("change", applyFilters);
  });

  [el.hero, el.size, el.tier, el.sort].forEach((x) => {
    x.addEventListener("change", applyFilters);
  });

  el.clearTags.addEventListener("click", () => {
    state.selectedTags.clear();
    el.tagList.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      cb.checked = false;
    });
    applyFilters();
  });
}

async function init() {
  try {
    const cfgRes = await fetch(CONFIG_PATH);
    if (cfgRes.ok) {
      const userConfig = await cfgRes.json();
      mergeConfig(userConfig);
    } else {
      mergeConfig();
    }

    const res = await fetch(state.config.dbPath);
    const raw = await res.json();
    state.items = raw.map(normalizeItem);
    buildControls();
    bindEvents();
    applyFilters();
  } catch (e) {
    el.summary.textContent = "加载失败，请确认你是通过本地 HTTP 服务打开页面。";
    console.error(e);
  }
}

init();
