import fs from 'fs';

const originalData = [
  {
    name: '明日坐标',
    artist: '林俊杰/王者荣耀',
    url: 'https://meting.qjqq.cn/?server=tencent&type=url&id=004BJRhU4g74fg',
    pic: 'https://meting.qjqq.cn/?server=tencent&type=pic&id=000AImqc0jgZOu',
    lrc: 'https://meting.qjqq.cn/?server=tencent&type=lrc&id=004BJRhU4g74fg',
  },
  {
    name: '不死之身',
    artist: '林俊杰',
    url: 'https://meting.qjqq.cn/?server=tencent&type=url&id=001p1Z5Z3lrPlu',
    pic: 'https://meting.qjqq.cn/?server=tencent&type=pic&id=002aaUOS24kcwh',
    lrc: 'https://meting.qjqq.cn/?server=tencent&type=lrc&id=001p1Z5Z3lrPlu',
  },
  {
    name: '为你揭晓',
    artist: '张艺兴/林俊杰',
    url: 'https://meting.qjqq.cn/?server=tencent&type=url&id=003XrK5P2xuSWF',
    pic: 'https://meting.qjqq.cn/?server=tencent&type=pic&id=001a22ZU1kyrDf',
    lrc: 'https://meting.qjqq.cn/?server=tencent&type=lrc&id=003XrK5P2xuSWF',
  },
  {
    name: '绝不绝',
    artist: '林俊杰/无畏契约',
    url: 'https://meting.qjqq.cn/?server=tencent&type=url&id=0039PnSs3QC2Dh',
    pic: 'https://meting.qjqq.cn/?server=tencent&type=pic&id=000cPuL32brjN5',
    lrc: 'https://meting.qjqq.cn/?server=tencent&type=lrc&id=0039PnSs3QC2Dh',
  },
  {
    name: '无杂质',
    artist: '蔡宥绮/林俊杰',
    url: 'https://meting.qjqq.cn/?server=tencent&type=url&id=001uOXrJ0x4vLk',
    pic: 'https://meting.qjqq.cn/?server=tencent&type=pic&id=',
    lrc: 'https://meting.qjqq.cn/?server=tencent&type=lrc&id=001uOXrJ0x4vLk',
  },
];

function processData(data) {
  return data.map((item, index) => {
    // 修改正则表达式以匹配字母数字组合的ID（如：001IpbDW34m1Gy）
    const songId = item.url.match(/id=([A-Za-z0-9]+)/)[1];
    return {
      id: index + 1,
      songId: songId,
      title: item.name,
      artist: item.artist,
      url: item.url,
      pic: item.pic,
      lrc: item.lrc,
      lyrics: [{ time: 0, text: '【点击播放加载歌词】' }],
    };
  });
}

const processedData = processData(originalData);
console.log(processedData);

// 将处理后的数据写入 JSON 文件
fs.writeFile('musicList.json', JSON.stringify(processedData, null, 2), (err) => {
  if (err) {
    console.error('写入文件时出错:', err);
  } else {
    // console.log('数据已成功写入 musicList.json');
  }
});
