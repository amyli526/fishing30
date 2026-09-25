// ===================== 真实照片素材 =====================
// 所有图片均从 Wikimedia Commons 等开放图库整理下载到 assets/images/
// 三个映射表：DAY_DAY_IMG（每天故事图）、CHAR_IMG（识字图）、SPEAK_IMG（说一说配图）

var IMG_DIR = "assets/images/";

var DAY_IMG = {
  4: "river2.jpg", 5: "net.jpg", 6: "carp.jpg", 7: "scales.jpg", 8: "hook.jpg",
  9: "float.jpg", 10: "knot.jpg", 11: "sea.jpg", 12: "river2.jpg", 13: "salmon.jpg",
  14: "river2.jpg", 15: "carp.jpg", 16: "koi3.jpg", 17: "seabass.jpg", 18: "pleco.jpg",
  19: "cloud.jpg", 20: "lifejacket.jpg", 21: "release.jpg", 22: "kidfishing.jpg",
  23: "night.jpg", 24: "salmon.jpg", 25: "writing.jpg", 26: "ruler.jpg",
  27: "line.jpg", 28: "fisherman.jpg", 29: "story.jpg", 30: "sunset.jpg"
};

var CHAR_IMG = {
  "水": "water.jpg", "鱼": "carp.jpg", "石": "stone.jpg", "竿": "rod.jpg",
  "金": "gold.jpg", "门": "door.jpg", "海": "sea.jpg", "河": "river2.jpg",
  "江": "river2.jpg", "天": "sky.jpg", "云": "cloud.jpg", "雨": "rain.jpg",
  "风": "wind.jpg", "月": "moon.jpg", "夜": "night.jpg", "沙": "sand.jpg",
  "春": "spring.jpg", "夏": "summer.jpg", "冬": "winter.jpg",
  "网": "net.jpg", "鸟": "bird.jpg", "手": "hand.jpg", "人": "person.jpg",
  "线": "line.jpg", "结": "knot.jpg", "钩": "hook.jpg", "鳞": "scales.jpg",
  "尺": "ruler.jpg", "长": "ruler.jpg", "记": "writing.jpg", "字": "writing.jpg",
  "咸": "salt.jpg", "干": "dried.jpg", "草": "grass.jpg", "泥": "water.jpg"
};

var SPEAK_IMG = {
  4: ["river2.jpg", "water.jpg", "river2.jpg"],
  5: ["net.jpg", "sky.jpg", "cloud.jpg"],
  6: ["carp.jpg", "water.jpg", "koi3.jpg"],
  7: ["scales.jpg", "scales.jpg", "night.jpg"],
  8: ["hook.jpg", "hook.jpg", "hand.jpg"],
  9: ["float.jpg", "float.jpg", "float.jpg"],
  10: ["knot.jpg", "knot.jpg", "knot.jpg"],
  11: ["sea.jpg", "moon.jpg", "sky.jpg"],
  12: ["river2.jpg", "sea.jpg", "koi3.jpg"],
  13: ["salmon.jpg", "salmon.jpg", "river2.jpg"],
  14: ["river2.jpg", "water.jpg", "river2.jpg"],
  15: ["carp.jpg", "water.jpg", "sunset.jpg"],
  16: ["koi3.jpg", "carp.jpg", "net.jpg"],
  17: ["seabass.jpg", "seabass.jpg", "sunset.jpg"],
  18: ["pleco.jpg", "grass.jpg", "grass.jpg"],
  19: ["cloud.jpg", "wind.jpg", "rain.jpg"],
  20: ["water.jpg", "hand.jpg", "lifejacket.jpg"],
  21: ["release.jpg", "release.jpg", "sea.jpg"],
  22: ["kidfishing.jpg", "net.jpg", "water.jpg"],
  23: ["night.jpg", "water.jpg", "moon.jpg"],
  24: ["salmon.jpg", "bird.jpg", "water.jpg"],
  25: ["writing.jpg", "ruler.jpg", "water.jpg"],
  26: ["ruler.jpg", "ruler.jpg", "ruler.jpg"],
  27: ["line.jpg", "line.jpg", "knot.jpg"],
  28: ["fisherman.jpg", "sky.jpg", "sun.jpg"],
  29: ["story.jpg", "story.jpg", "story.jpg"],
  30: ["sunset.jpg", "sunset.jpg", "sunset.jpg"]
};

// 把照片自动挂接到每天的课程数据上（故事图 / 说一说配图 / 识字图）
function applyPhotos() {
  if (typeof DAY_DATA === "undefined") return;
  for (var n in DAY_DATA) {
    var d = DAY_DATA[n];
    if (!d || d.title === undefined) continue;
    if (!d.img && DAY_IMG[n]) d.img = IMG_DIR + DAY_IMG[n];
    if (d.speak && typeof d.speak[0] === "string") {
      var imgs = SPEAK_IMG[n];
      d.speak = d.speak.map(function (s, i) {
        return { t: s, img: imgs && imgs[i] ? IMG_DIR + imgs[i] : "" };
      });
    }
    if (d.vocab) {
      d.vocab.forEach(function (v) {
        if (!v.img && CHAR_IMG[v.char]) v.img = IMG_DIR + CHAR_IMG[v.char];
      });
    }
  }
}