
export const config = {
  toName: "小菊",
  fromName: "余占宇",
  mainTitle: "腊月十三 · 生日快乐",
  subTitle: "愿你自由、明亮，也被温柔照顾",
  optionalLine: "那天在婚礼上认识你，后来发现你真的很闪。",
  buttonText: "把祝福点亮",
  finalToast: "小菊，今天也要快乐呀 :)",
  // 音乐地址保持直链
  bgmUrl: "https://files.catbox.moe/k2r86u.mp3", 
  bgmLabel: "生日快乐",
  blessings: [
    "希望你在新的一岁，依然自由，依然闪。",
    "愿你被理解，也被偏爱，但更重要的是被自己喜欢。",
    "愿你忙的时候有收获，闲的时候有快乐。",
    "愿你把温柔留给生活，把坚定留给自己。",
    "愿你不必很用力，也能拥有很多好运。",
    "愿你每一次选择，都更靠近你想成为的自己。",
    "愿你快乐不必盛大，但一直在。",
    "愿你遇到的都是小确幸，攒起来就是大幸运。",
    "愿你永远保留一点孩子气，也保留一点锋芒。",
    "愿你今天被祝福包围，明天也一样。"
  ],
  easterWishTitle: "一条隐藏祝福",
  easterWishBody: "小菊，其实世界很大，但我很高兴能在这里认识你。你身上那种闪闪发光的东西，希望你能一直保留着。祝你永远开心，值得世间所有美好。",
  // 修改为本地路径，建议将图片放入 public/photos/ 目录下，命名为 1.jpg, 2.jpg...
  photoUrls: Array.from({ length: 8 }, (_, i) => ({
    url: `/photos/${i + 1}.jpg`,
    title: `Moment #${i + 1}`
  }))
};
