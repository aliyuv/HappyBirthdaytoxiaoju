
import React from 'react';

export const CONFIG = {
  toName: "小菊",
  fromName: "余占宇",
  mainTitle: "腊月十三 · 生日快乐",
  subTitle: "愿你自由、明亮，也被温柔照顾",
  optionalLine: "那天在婚礼上认识你·后来发现你真的很闪",
  buttonText: "把祝福点亮",
  finalToast: "小菊，今天也要快乐呀 :)",
  blessings: [
    "愿你所有的深情都不被辜负",
    "愿你一生努力，一生被爱",
    "想要的都拥有，得不到的都释怀",
    "愿你眼里有光，心中有海",
    "愿你在被爱的同时也深爱着世界",
    "生日快乐，岁岁年年"
  ],
  photoUrls: Array.from({ length: 9 }, (_, i) => ({
    url: `https://picsum.photos/seed/${i + 123}/600/800`,
    title: `回忆碎片 #${i + 1}`
  }))
};
