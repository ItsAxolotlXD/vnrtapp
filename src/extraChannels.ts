import { Channel } from "./channels";

// Pre-defined tuples of [name, stream, tvgId, customLogo]
const rawExtraData: [string, string, string, string?][] = [
  // Block 1: India
  ["7S Music (576p)", "https://mumt03.tangotv.in/Dsly5z3H7SMUSIC/index.m3u8", "7SMusic.in@SD"],
  ["9X Jalwa (1080p)", "https://b.jsrdn.com/strm/channels/9xjalwa/master.m3u8", "9XJalwa.in@SD"],
  ["9XM (1080p)", "https://9xjio.wiseplayout.com/9XM/master.m3u8", "9XM.in@SD"],
  ["Aaj Tak HD (1080p)", "https://feeds.intoday.in/aajtak/api/aajtakhd/master.m3u8", "AajTak.in@HD"],
  ["ABP News (1080p)", "https://d2l4ar6y3mrs4k.cloudfront.net/live-streaming/abpnews-livetv/master.m3u8", "ABPNews.in@SD"],
  ["Asianet News (1080p)", "https://amg13737-amg13737c1-amgplt0016.playout.now3.amagi.tv/playlist/amg13737-amg13737c1-amgplt0016/playlist.m3u8", "AsianetNews.in@SD"],
  ["B4U Bhojpuri (1080p)", "https://cdnb4u.wiseplayout.com/B4U_Bhojpuri/master.m3u8", "B4UBhojpuri.in@SD"],
  ["CNBC TV18 (1080p)", "https://n18syndication.akamaized.net/bpk-tv/CNBC_TV18_NW18_MOB/output01/index.m3u8", "CNBCTV18.in@SD"],
  ["Colors HD (1080p)", "http://149.71.34.166:8000/play/a00c/index.m3u8", "Colors.in@HD"],
  ["Dangal TV (720p)", "https://live-dangal.akamaized.net/liveabr/playlist.m3u8", "DangalTV.in@SD"],
  ["ETV Telugu HD (1080p)", "https://d27zlkxhgwrfgo.cloudfront.net/v1/master/9d43eacaed199f8d5883927e7aef514a8a08e108/ETV_HD_H264_cloud_in/index.m3u8", "ETVTelugu.in@HD"],
  ["History TV18 HD (1080p)", "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/HistoryTV18HD.m3u8", "HistoryTV18.in@HD"],
  ["India Today (720p)", "https://d1rc86nwwc9fag.cloudfront.net/vglive-sk-293160/master.m3u8", "IndiaToday.in@SD"],
  ["India TV (720p)", "https://pl-indiatvnews.akamaized.net/out/v1/db79179b608641ceaa5a4d0dd0dca8da/index.m3u8", "IndiaTV.in@SD"],
  ["National Geographic Wild HD (1080p)", "http://149.71.34.166:8002/play/a012/index.m3u8", "NationalGeographicWild.in@HD"],
  ["News18 India (1080p)", "https://n18syndication.akamaized.net/bpk-tv/News18_India_NW18_MOB/output01/master.m3u8", "News18India.in@SD"],
  ["NTV Telugu (1080p)", "https://mumbai-edge.smartplaytv.in/NTVTelugu/index.m3u8", "NTVTelugu.in@SD"],
  ["Republic TV (1080p)", "https://samsung-republictv.amagi.tv/ts-ap-s1-n1/playlist/samsungin-republictv-samsungindia/playlist.m3u8", "RepublicTV.in@SD"],
  ["Sony Entertainment Television HD (1080p)", "http://stb-air.wasmer.app/play.php?id=LIVETV_LIVETVCHANNEL_SET_HD&pass=krish-ka&uid=gana-sunega", "SonyEntertainmentTelevision.in@HD"],
  ["Star Sports 1 HD (1080p)", "http://103.253.18.58:8000/play/a00m", "StarSports1.in@HD"],
  ["WION (Adaptive) (1080p)", "https://raw.githubusercontent.com/Alstruit/adaptive-streams/alstruit-10_23_in/streams/in/WION.in.m3u8", "WION.in@SD"],
  ["Zee News (1080p)", "https://dt3lrqnyx3dks.cloudfront.net/index.m3u8", "ZeeNews.in@SD"],

  // Block 2: USA
  ["ABC (720p)", "http://41.205.93.154/ABC/index.m3u8", "ABC.us@East"],
  ["beIN SPORTS XTRA (1080p)", "https://bein-xtra-bein.amagi.tv/playlist.m3u8", "beINSPORTSXTRA.us@SD"],
  ["Bloomberg TV US (720p)", "https://bloomberg.com/media-manifest/streams/us.m3u8", "BloombergTV.us@US"],
  ["Comedy Central (1080p)", "http://23.237.104.106:8080/USA_COMEDY_CENTRAL/index.m3u8", "ComedyCentral.us@East"],
  ["Disney XD (720p)", "http://23.237.104.106:8080/USA_DISNEY_XD/index.m3u8", "DisneyXD.us@East"],
  ["Fox Weather (720p)", "https://247wlive.foxweather.com/stream/index.m3u8", "FoxWeather.us@SD"],
  ["MTV (720p)", "http://198.58.104.90:8989/mtv/index.m3u8", "MTV.us@East"],
  ["NBC News NOW (1080p)", "https://livehub-voidnet.onrender.com/cluster/streamcore/us/NBC_REDIS.m3u8", "NBCNewsNOW.us@SD"],
  ["Nickelodeon (1080p)", "http://23.237.104.106:8080/USA_NICKELODEON/index.m3u8", "Nickelodeon.us@East"],
  ["Paramount Network (720p)", "http://rezofoot.tv/PARAMOUNT-CHANNEL/index.m3u8", "ParamountNetwork.us@East"],
  ["PBS Kids (720p)", "https://livestream.pbskids.org/out/v1/14507d931bbe48a69287e4850e53443c/est.m3u8", "PBSKids.us@SD"],
  ["Showtime (1080p)", "http://23.237.104.106:8080/USA_SHOWTIME/index.m3u8", "Showtime.us@East"],
  ["Starz (1080p)", "http://23.237.104.106:8080/USA_STARZ/index.m3u8", "Starz.us@East"],
  ["USA Network (720p)", "http://185.246.209.113/DISCOVERYHD/index.m3u8", "USANetwork.us@East"],

  // Block 3: China
  ["CCTV-1 (1080p)", "http://69.30.245.50/live/cctv1.m3u8", "CCTV1.cn@HD"],
  ["CCTV-3 (720p)", "http://74.91.26.218:82/live/cctv3hd.m3u8", "CCTV3.cn@SD"],
  ["CCTV-6 (1080p)", "http://69.30.245.50/live/cctv6.m3u8", "CCTV6.cn@HD"],
  ["CCTV-13 (1080p)", "http://go.bkpcp.top/mg/cctv13", "CCTV13.cn@HD"],
  ["Hunan TV (2160p)", "http://hlsal-ldvt.qing.mgtv.com/nn_live/nn_x64/dWlwPTEyNy4wLjAuMSZ1aWQ9cWluZy1jbXMmbm5fdGltZXpvbmU9OCZjZG5leF9pZD1hbF9obHNfbGR2dCZ1dWlkPTliODY4NmU5ZTM2YzYwMmMmZT02OTE0NjA0JnY9MSZpZD1ITldTWkdTVCZzPTcwN2RiYTc2YzJjNmJmMTQ4MmUyZGYzOWU2NWM3YWFi/HNWSZGST.m3u8", "HunanTV.cn@SD"],
  ["Zhejiang Satellite TV", "https://play-qukan.cztv.com/live/1758879019692345.m3u8", "ZhejiangSatelliteTV.cn@SD"],
  ["Phoenix Chinese Channel (720p)", "http://223.110.245.167/ott.js.chinamobile.com/PLTV/3/224/3221226922/index.m3u8", "PhoenixChineseChannel.hk@SD"],

  // Block 4: Spain
  ["Antena 3 Internacional", "http://177.10.184.193:8000/play/a06a/index.m3u8", "Antena3Internacional.es@SD"],
  ["Real Madrid TV (404p)", "https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8", "RealMadridTV.es@SD"],
  ["Teledeporte (720p)", "https://rtvelivestream.rtve.es/rtvesec/tdp/tdp_main.m3u8", "Teledeporte.es@SD"],
  ["TVE Star HD (1080p)", "https://rtvelivestream-rtveplayplus.rtve.es/rtvesec/int/star_main_1080.m3u8", "TVEStar.es@HD"],

  // Block 5: Italy
  ["Canale 5", "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(C5)/index.m3u8", "Canale5.it@SD"],
  ["Italia 1", "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(i1)/index.m3u8", "Italia1.it@SD"],
  ["Rai 1 HD (1080p)", "https://srv1.adriatelekom.com/Rai1/index.m3u8", "Rai1.it@HD"],
  ["Rai 2 HD (1080p)", "https://srv1.adriatelekom.com/Rai2/index.m3u8", "Rai2.it@HD"],

  // Block 6: Russia
  ["360° (1080p)", "https://cdn-evacoder-tv.facecast.io/evacoder_hls_hi/CkxfR1xNUAJwTgtXTBZTAJli/index.m3u8", "360.ru@SD"],
  ["NTV HD (1080p)", "https://cdn-dvr.ntv.ru/ntv0_hd/index.m3u8", "NTV.ru@HD"],
  ["Russia-1 HD (1080p)", "https://stream.smotrim.ru/hls2/russia_hd/playlist_6.m3u8", "Russia1.ru@HD"],
  ["Russia-24 (720p)", "https://stream.smotrim.ru/hls2/russia24nl_smotrim/playlist_5.m3u8", "Russia24.ru@SD"]
];

function detectCategoryAndLogo(tvgId: string, name: string): { category: string; logo: string; countryFlag?: string } {
  const idLower = tvgId.toLowerCase();
  const nameLower = name.toLowerCase();

  let category = "Quốc tế";
  let countryFlag: string | undefined = undefined;

  if (idLower.includes(".in@") || idLower.includes("india") || nameLower.includes("aaj tak") || nameLower.includes("9x") || nameLower.includes("colors") || nameLower.includes("dangal") || nameLower.includes("news18") || nameLower.includes("etv") || nameLower.includes("star sports") || nameLower.includes("republic") || nameLower.includes("sony") || nameLower.includes("wion") || nameLower.includes("abp")) {
    category = "Kênh Ấn Độ";
    countryFlag = "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg";
  } else if (idLower.includes(".us@") || idLower.includes("america") || nameLower.includes("abc") || nameLower.includes("bein") || nameLower.includes("bloomberg") || nameLower.includes("comedy central") || nameLower.includes("disney") || nameLower.includes("fox") || nameLower.includes("mtv") || nameLower.includes("nbc") || nameLower.includes("nickelodeon") || nameLower.includes("paramount") || nameLower.includes("pbs") || nameLower.includes("showtime") || nameLower.includes("starz") || nameLower.includes("usa network")) {
    category = "Kênh Mỹ";
    countryFlag = "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg";
  } else if (idLower.includes(".cn@") || idLower.includes("china") || nameLower.includes("cctv") || nameLower.includes("hunan") || nameLower.includes("zhejiang") || nameLower.includes("phoenix")) {
    category = "Kênh Trung Quốc";
    countryFlag = "https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg";
  } else if (idLower.includes(".es@") || idLower.includes("spain") || nameLower.includes("antena") || nameLower.includes("real madrid") || nameLower.includes("teledeporte") || nameLower.includes("tve")) {
    category = "Kênh Tây Ban Nha";
    countryFlag = "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg";
  } else if (idLower.includes(".it@") || idLower.includes("italy") || nameLower.includes("canale 5") || nameLower.includes("italia 1") || nameLower.includes("rai")) {
    category = "Kênh Ý";
    countryFlag = "https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg";
  } else if (idLower.includes(".ru@") || idLower.includes("russia") || nameLower.includes("360°") || nameLower.includes("ntv") || nameLower.includes("russia-1") || nameLower.includes("russia-24")) {
    category = "Kênh Nga";
    countryFlag = "https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg";
  }

  let brandLogo: string | null = null;
  if (nameLower.includes("abc")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/3/30/ABC_logo_2021.svg";
  else if (nameLower.includes("bloomberg")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/5/50/Bloomberg_logo.svg";
  else if (nameLower.includes("disney")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/3/3d/Disney_XD_logo_2015.svg";
  else if (nameLower.includes("mtv")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/6/67/MTV_logo_2021.svg";
  else if (nameLower.includes("nickelodeon")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/c/c4/Nickelodeon_logo_2023.svg";
  else if (nameLower.includes("paramount")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/d/df/Paramount_Network_logo_2018.svg";
  else if (nameLower.includes("showtime")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/2/22/Showtime_logo.svg";
  else if (nameLower.includes("starz")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/7/70/Starz_2016.svg";
  else if (nameLower.includes("bein sports")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/3/32/BeIN_Sports_logo.svg";
  else if (nameLower.includes("cctv-1")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/8/87/CCTV-1_logo.svg";
  else if (nameLower.includes("cctv-3")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/2/23/CCTV-3_logo.svg";
  else if (nameLower.includes("cctv-6")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/5/59/CCTV-6_logo.svg";
  else if (nameLower.includes("cctv-13")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/b/b3/CCTV-13_logo.svg";
  else if (nameLower.includes("hunan tv")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/5/5a/Hunan_TV_logo.svg";
  else if (nameLower.includes("phoenix")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/3/3c/Phoenix_Satellite_Television_logo.svg";
  else if (nameLower.includes("real madrid")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/5/56/Real_Madrid_CF.svg";
  else if (nameLower.includes("rai 1")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/5/5a/Rai_1_logo_%282016%29.svg";
  else if (nameLower.includes("rai 2")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/f/fc/Rai_2_logo_%282016%29.svg";
  else if (nameLower.includes("canale 5")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/a/af/Canale_5_logo_2018.svg";
  else if (nameLower.includes("italia 1")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/3/3e/Italia_1_logo_2018.svg";
  else if (nameLower.includes("russia-1")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/a/a2/Rossiya_1_logo_2012.svg";
  else if (nameLower.includes("russia-24")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/e/ee/Rossiya_24_logo_2012.svg";
  else if (nameLower.includes("ntv")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/0/07/NTV_Logo_Russia.svg";
  else if (nameLower.includes("wion")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/e/e0/WION_Logo.svg";
  else if (nameLower.includes("aaj tak")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/a/a9/Aaj_Tak_Logo.svg";
  else if (nameLower.includes("star sports")) brandLogo = "https://upload.wikimedia.org/wikipedia/commons/f/ff/Star_Sports_logo_2021.svg";

  const logo = brandLogo || countryFlag || "https://static.wikia.nocookie.net/logos/images/3/32/THVL1_logo_ident_2025.png/revision/latest/scale-to-width-down/1000?cb=20251206083051&path-prefix=vi";

  return { category, logo, countryFlag };
}

export function getExtraChannels(): Channel[] {
  const vtvGoLogo = "https://static.wikia.nocookie.net/ep-deo/images/6/64/Vtv_s%E1%BB%A7a.png/revision/latest/scale-to-width-down/1000?cb=20260625120702";
  return rawExtraData.map(([name, stream, tvgId, customLogo]) => {
    const { category, logo, countryFlag } = detectCategoryAndLogo(tvgId, name);
    // If the detected logo is the generic flag itself, replace it with VTVgo logo
    const isUsingFlagAsLogo = logo === countryFlag;
    const finalLogo = isUsingFlagAsLogo ? vtvGoLogo : (customLogo || logo);

    return {
      category,
      name,
      logo: finalLogo,
      stream,
      desc: `Kênh ${name} từ nguồn danh sách IPTV Quốc tế.`,
      countryFlag,
    };
  });
}
