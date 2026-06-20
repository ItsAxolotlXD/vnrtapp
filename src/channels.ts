export type Channel = {
  category: string;
  name: string;
  logo: string;
  stream: string;
  status?: "working" | "maintenance" | "coming-soon";
  qualityBadge?: string;
  qualityColor?: string;
  desc?: string;
};

function formatLocalChannelName(name: string): string {
  // Clean trailing HD
  const cleanName = name.replace(/\s+HD$/i, "").trim();

  // Custom maps for shorthand or special case local names
  if (cleanName === "H1") return "TRUYỀN HÌNH HÀ NỘI 1 (H1 HD)";
  if (cleanName === "H2") return "TRUYỀN HÌNH HÀ NỘI 2 (H2 HD)";
  if (cleanName === "ĐNNRTV1") return "TRUYỀN HÌNH ĐỒNG NAI 1 (ĐN1 HD)";
  if (cleanName === "ĐNNRTV2") return "TRUYỀN HÌNH ĐỒNG NAI 2 (ĐN2 HD)";

  // Match: MAIN (SUB) or just MAIN
  const match = cleanName.match(/^([^()]+?)\s*(?:\(([^()]+)\))?$/);
  if (match) {
    const main = match[1].trim().toUpperCase();
    const sub = match[2] ? match[2].trim().toUpperCase() : "";

    if (sub) {
      const subClean = sub.endsWith(" HD") ? sub : `${sub} HD`;
      return `TRUYỀN HÌNH ${main} (${subClean})`;
    } else {
      return `TRUYỀN HÌNH ${main} (HD)`;
    }
  }

  return `TRUYỀN HÌNH ${cleanName.toUpperCase()} (HD)`;
}

const rawChannels: Channel[] = [
  // VTV
  { category: "VTV", name: "VTV1", logo: "https://static.wikia.nocookie.net/ftv/images/a/ac/1vv.png/revision/latest/scale-to-width-down/1000?cb=20260604052331&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd1/vtv1hd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH TRUYỀN HÌNH THỜI SỰ - CHÍNH TRỊ" },
  { category: "VTV", name: "VTV2", logo: "https://static.wikia.nocookie.net/ftv/images/5/5b/2f.png/revision/latest/scale-to-width-down/1000?cb=20260604052625&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd1/vtv2hd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH TRUYỀN HÌNH KHOA HỌC - GIÁO DỤC" },
  { category: "VTV", name: "VTV3", logo: "https://static.wikia.nocookie.net/ftv/images/3/32/V3.png/revision/latest/scale-to-width-down/1000?cb=20260601093014&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd1/vtv3hd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH TRUYỀN HÌNH GIẢI TRÍ - THÔNG TIN" },
  { category: "VTV", name: "VTV4", logo: "https://static.wikia.nocookie.net/ftv/images/0/02/Imagei4.png/revision/latest/scale-to-width-down/1000?cb=20260601093135&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd1/vtv4hd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH TRUYỀN HÌNH DÀNH CHO KIỀU BÀO VIỆT" },
  { category: "VTV", name: "VTV5", logo: "https://static.wikia.nocookie.net/ftv/images/7/79/Imagej42.png/revision/latest/scale-to-width-down/1000?cb=20260601093345&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd1/vtv5hd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH TRUYỀN HÌNH DÂN TỘC VÀ NÔNG THÔN" },
  { category: "VTV", name: "VTV6", logo: "https://static.wikia.nocookie.net/ftv/images/c/c1/V6.png/revision/latest/scale-to-width-down/1000?cb=20260601093700&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd1/vtv6hd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH TRUYỀN HÌNH THỂ THAO" },
  { category: "VTV", name: "VTV7", logo: "https://static.wikia.nocookie.net/ftv/images/4/43/Image7.png/revision/latest/scale-to-width-down/1000?cb=20260601093859&path-prefix=vi", stream: "https://live.fptplay53.net/live/media/vtv7/live247-hls-avc/index.m3u8", desc: "KÊNH TRUYỀN HÌNH GIÁO DỤC QUỐC GIA" },
  { category: "VTV", name: "VTV8", logo: "https://static.wikia.nocookie.net/ftv/images/b/b1/Imagea8.png/revision/latest/scale-to-width-down/1000?cb=20260601094212&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd1/vtv8hd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH TRUYỀN HÌNH VĂN HÓA - LỊCH SỬ - DU LỊCH" },
  { category: "VTV", name: "VTV9", logo: "https://static.wikia.nocookie.net/ftv/images/8/8c/Imagei9.png/revision/latest/scale-to-width-down/1000?cb=20260601094610&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd1/vtv9hd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH TRUYỀN HÌNH KINH TẾ - ĐÔ THỊ" },
  { category: "VTV", name: "VTV Cần Thơ", logo: "https://static.wikia.nocookie.net/ftv/images/a/a0/I10.png/revision/latest/scale-to-width-down/1000?cb=20260601094723&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd1/vtvcantho_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH TRUYỀN HÌNH NÔNG NGHIỆP - NÔNG THÔN" },
  { category: "VTV", name: "VTV5 Tây Nam Bộ", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/VTV5_logo_24.png", stream: "https://live.fptplay53.net/live/media/vtv5tnb/live-hls-avc/index.m3u8" },
  { category: "VTV", name: "VTV5 Tây Nguyên", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/VTV5_logo_24.png", stream: "https://live.fptplay53.net/live/media/vtv5tn/live-hls-avc/index.m3u8" },
  { category: "VTV", name: "Vietnam Today", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d2/VTV_logo_24.png", stream: "https://live.fptplay53.net/fnxhd1/vntoday_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH TRUYỀN HÌNH ĐỐI NGOẠI QUỐC GIA" },

  // VTVcab
  { category: "VTVcab", name: "ON TRENDING TV", logo: "https://img.vtvprime.vn/55xu-sW33ZbTdC_Jok1jkP6jWGpa3U96dXvvDuXoyz0/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvOGZjNzVhY2EtYjZhYS00MjYwLWIwMDMtZDRkYzg4OWI4ZGNkLnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=186" },
  { category: "VTVcab", name: "ON Kids", logo: "https://img.vtvprime.vn/L7ERumqY3GEtK8vTe_DtMEJRYJkZPrVD3O4cbdT5P44/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvOGFlYmUzZGMtODZmYS00NGFkLTlhNzUtODg5NmFkODZhNGI3LnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=179" },
  { category: "VTVcab", name: "ON Golf", logo: "https://static.wikia.nocookie.net/logos/images/f/ff/ON_Golf_logo_2022.png/revision/latest/scale-to-width-down/1000?cb=20220311023800&path-prefix=vi", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=169" },
  { category: "VTVcab", name: "ON E- Channel", logo: "https://img.vtvprime.vn/bofK3Lca_KQJMc9sb6pUyQ_A41aWbsQi2ibNAzkN3I0/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvZTk3YjgwOGUtNjI3OS00NWQ4LWJkMTAtNWY1MGE1MjIwMTZkLnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=182" },
  { category: "VTVcab", name: "ON Vie Giải Trí", logo: "https://img.vtvprime.vn/gV1k4G1mCGQpnNGJFCJQISd0-p96jY14Ufz_mOb8h_o/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvZjVhZDhkNmBiMTQ4NS00YjYxLThhMDEtNTdiYzBiMjU2NGU1LnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=180" },
  { category: "VTVcab", name: "ON Vie Dramas", logo: "https://img.vtvprime.vn/mVzz9rvhJ_BCun2e4ILB0OYl8ptcxG9TsSrIZ85kpLk/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvMmExZjgwNGYtNjc0Yi00ZjYzLThjZWMtNjgwN2NkNThhYTRkLnBuZw==.png", stream: "http://dvrfl05.bozztv.com/vch_vchannel18/tracks-v1a1/mono.m3u8" },
  { category: "VTVcab", name: "ON Phim Việt", logo: "https://img.vtvprime.vn/vDASEJI2IRP0eBox0ta6hgKo4vnY-3AdofWLa5lSqjM/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvZTc3YzdkNmItZTVhNi00ZTkyLWIzYzUtMGEzMTkyZjIyM2RhLnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=175" },
  { category: "VTVcab", name: "ON Movies - You TV", logo: "https://img.vtvprime.vn/8-eDFNeJkwyONvmJVu_JydPc2dZaNJXuBTY7vtvCxxE/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvZWQzOTEzNjgtYTJmNy00NDBkLWI0N2ItNzA2MDliNjJmNDYzLnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=181" },
  { category: "VTVcab", name: "ON O2TV", logo: "https://img.vtvprime.vn/5FxYjiz34GsArbti7aFiSkIO7NMCxKNZcQJ9AvIme80/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvODAyNGIwMDQtNGJiNC00M2Y3LWJkYmEtYmU0MWVkMGY0NjM4LnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=136" },
  { category: "VTVcab", name: "ON BiBi", logo: "https://img.vtvprime.vn/vjXRRLGeFrNx1iAkqhrK9RoAgU1oW6kq5q_6r7cd9zs/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvYzI3NWExNmEtNTMwOS00ZWE3LWJjMjMtYTMyNGIwZDczNGJlLnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=178" },
  { category: "VTVcab", name: "ON Info TV", logo: "https://img.vtvprime.vn/nCr-YgSmtNg5gcpJ35d6l_T4DUWz8fzr9EJpd9jAZ6E/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvM2E2NzM5NzQtNzRhYi00MjYxLTg2M2QtZWE2YzUyNzU5YzcyLnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=189" },
  { category: "VTVcab", name: "ON Cine", logo: "https://img.vtvprime.vn/XY6SjolNpy8W8Eh_v_2oDyE6BiNOvofLosgPYO-hlY4/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvZTY5YjgyNmUtNjkzYi00YzBiLWFhZmYtNmFhZGFjZjFhZDA0LnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=176" },
  { category: "VTVcab", name: "ON Style TV", logo: "https://img.vtvprime.vn/TxObOi0p9hC6K414i12Fk27SP8s_QKswAvPaRH2kK6M/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvNTcyOGM3MzEtOWE4OS00ZjljLTkyYTItMWVhODZmNzhiOWE4LnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=184" },
  { category: "VTVcab", name: "ON Music", logo: "https://img.vtvprime.vn/39RnkA6ZHfNSCcsMaaSivvTVwmWjeGsbqlQsmD7nuvQ/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvN2RmOTYzYTYtZWRkYS00MDdjLWIxYmYtYTAwODBhMTUyYTNlLnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=185" },
  { category: "VTVcab", name: "ON V Family", logo: "https://img.vtvprime.vn/8oeGePxG0Z-iJqm5biFVNdMdAlVHFDYsS0i7i3IpH2Y/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvOGI0YzYzOTgtNWJiOS00ODQ1LWE1ZjMtZTdhZTM5ZTc4NzVmLnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=187" },
  { category: "VTVcab", name: "ON Life", logo: "https://img.vtvprime.vn/cJ9URVIqC2BkU1gsT0IKiEy0tXDXqu7C4M3Ni3hjlgY/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvY2U2MWMwZGEtMWI1Zi00ZWJiLWE4ZTktZjdmZTVkNzRlODhmLnBuZw==.png", stream: "https://vpsttt.vietanhtv.top/tv360/tv360.php?id=188" },

  // HTV
  { category: "HTV", name: "HTV1", logo: "https://static.wikia.nocookie.net/ftv/images/0/04/HTV1.png/revision/latest/scale-to-width-down/1000?cb=20260601104705&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd1/htv1_hls.smil/chunklist_b2500000.m3u8" },
  { category: "HTV", name: "HTV2 / Vie Channel", logo: "https://static.wikia.nocookie.net/ftv/images/9/99/HTV2.png/revision/latest/scale-to-width-down/1000?cb=20260601105845&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd1/htv2hd_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "HTV", name: "HTV3", logo: "https://static.wikia.nocookie.net/ftv/images/2/26/H3.png/revision/latest/scale-to-width-down/1000?cb=20260601110041&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd1/htv3_hls.smil/chunklist_b2500000.m3u8" },
  { category: "HTV", name: "HTV4", logo: "https://static.wikia.nocookie.net/ftv/images/d/d4/H4.png/revision/latest/scale-to-width-down/1000?cb=20260601110245&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd1/htv4_hls.smil/chunklist_b2500000.m3u8" },
  { category: "HTV", name: "HTV5 / B Channel", logo: "https://static.wikia.nocookie.net/ftv/images/e/ec/H5.png/revision/latest/scale-to-width-down/1000?cb=20260601110811&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/btv9_hls.smil/chunklist_b2500000.m3u8" },
  { category: "HTV", name: "HTV7", logo: "https://static.wikia.nocookie.net/ftv/images/6/60/H7.png/revision/latest/scale-to-width-down/1000?cb=20260601112033&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd1/htv7hd_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "HTV", name: "HTV9", logo: "https://static.wikia.nocookie.net/ftv/images/e/e4/H9.png/revision/latest/scale-to-width-down/1000?cb=20260601111956&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd1/htv9hd_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "HTV", name: "HTV Thể Thao", logo: "https://static.wikia.nocookie.net/ftv/images/5/5c/H6.png/revision/latest/scale-to-width-down/1000?cb=20260601112653&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd1/htvcthethao_vhls.smil/chunklist_b5000000.m3u8" },

  // HTVC
  { category: "HTVC", name: "HTVC Thể Thao", logo: "https://upload.wikimedia.org/wikipedia/vi/d/d4/HTVC_Th%E1%BB%83_thao.png", stream: "https://live.fptplay53.net/epzhd1/htvcthethao_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH THỂ THAO CHUYÊN BIỆT CỦA HTVC" },
  { category: "HTVC", name: "HTVC Ca Nhạc", logo: "https://upload.wikimedia.org/wikipedia/vi/a/ad/HTVC_Ca_nh%E1%BA%A1c.png", stream: "https://live.fptplay53.net/epzhd1/htvcmusic_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH CA NHẠC GIẢI TRÍ HTVC MUSIC" },
  { category: "HTVC", name: "HTVC Du Lịch", logo: "https://upload.wikimedia.org/wikipedia/vi/9/98/HTVC_Du_l%E1%BB%8Bch.png", stream: "https://live.fptplay53.net/epzhd1/htvcdulich_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH VĂN HÓA, DU LỊCH, KHÁM PHÁ" },
  { category: "HTVC", name: "HTVC Gia Đình", logo: "https://upload.wikimedia.org/wikipedia/vi/1/18/HTVC_Gia_%C4%91%C3%ACnh.png", stream: "https://live.fptplay53.net/epzhd1/htvcgiadinh_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH TRUYỀN HÌNH DÀNH CHO GIA ĐÌNH VÀ PHỤ NỮ" },
  { category: "HTVC", name: "HTVC Phim HD", logo: "https://upload.wikimedia.org/wikipedia/vi/3/36/HTVC_Phim.png", stream: "https://live.fptplay53.net/epzhd1/htvcmovieshd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH PHIM TRUYỆN ĐẶC SẮC CHÂU Á VÀ THẾ GIỚI" },
  { category: "HTVC", name: "HTVC Phụ Nữ", logo: "https://upload.wikimedia.org/wikipedia/vi/4/4e/HTVC_Ph%E1%BB%A5_n%E1%BB%AF.png", stream: "https://live.fptplay53.net/epzhd1/htvcphunu_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH THÔNG TIN VÀ CHĂM SÓC SỨC KHỎE PHỤ NỮ" },
  { category: "HTVC", name: "HTVC Thuần Việt HD", logo: "https://upload.wikimedia.org/wikipedia/vi/3/3a/Thu%E1%BA%A7n_Vi%E1%BB%87t.png", stream: "https://live.fptplay53.net/epzhd1/htvcthuanviethd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH VĂN HÓA & NGHỆ THUẬT THUẦN VIỆT ĐẶC SẮC" },
  { category: "HTVC", name: "HTVC+ HD", logo: "https://upload.wikimedia.org/wikipedia/vi/e/ec/HTVC_Plus.png", stream: "https://live.fptplay53.net/epzhd1/htvcplus_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH THÔNG TIN GIẢI TRÍ TỔNG HỢP HTVC+" },

  // Địa phương
  { category: "Địa phương", name: "An Giang 1 (ATV1)", logo: "https://static.wikia.nocookie.net/ftv/images/f/f3/Atv.png/revision/latest/scale-to-width-down/1000?cb=20260601113339&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/angiang01_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "An Giang 2 (ATV2)", logo: "https://static.wikia.nocookie.net/ftv/images/5/57/2a.png/revision/latest/scale-to-width-down/1000?cb=20260601113455&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/angiang_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "An Giang 3 (ATV3)", logo: "https://static.wikia.nocookie.net/ftv/images/a/ae/Atv3.png/revision/latest/scale-to-width-down/1000?cb=20260601113538&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/angiang03_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Bắc Ninh (BTV)", logo: "https://static.wikia.nocookie.net/ftv/images/f/f6/Btv.png/revision/latest/scale-to-width-down/1000?cb=20260601113719&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/bacninh01_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Cần Thơ 1", logo: "https://static.wikia.nocookie.net/ftv/images/8/81/Ca1.png/revision/latest/scale-to-width-down/1000?cb=20260601115151&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/cantho_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Cần Thơ 2", logo: "https://static.wikia.nocookie.net/ftv/images/a/a4/C2.png/revision/latest/scale-to-width-down/1000?cb=20260601121535&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/cantho02_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Địa phương", name: "Cần Thơ 3", logo: "https://static.wikia.nocookie.net/ftv/images/5/54/C3.png/revision/latest/scale-to-width-down/1000?cb=20260601121700&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/cantho03_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Cà Mau (CTV)", logo: "https://static.wikia.nocookie.net/ftv/images/5/5c/Imagectv.png/revision/latest/scale-to-width-down/1000?cb=20260601113905&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/camau_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Cao Bằng (CRTV)", logo: "https://static.wikia.nocookie.net/ftv/images/6/65/Caobang.png/revision/latest/scale-to-width-down/1000?cb=20260601121751&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/caobang_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Điện Biên (ĐTV)", logo: "https://static.wikia.nocookie.net/ftv/images/9/91/D4.png/revision/latest/scale-to-width-down/1000?cb=20260601122957&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/dienbien_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Đà Nẵng 1 (DNRT1)", logo: "https://static.wikia.nocookie.net/ftv/images/c/c6/D1.png/revision/latest/scale-to-width-down/1000?cb=20260601122210&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/danang1_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Đà Nẵng 2 (DNRT2)", logo: "https://static.wikia.nocookie.net/ftv/images/8/8b/D2.png/revision/latest/scale-to-width-down/1000?cb=20260601122329&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/danang2_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Đắk Lắk (DRT)", logo: "https://static.wikia.nocookie.net/ftv/images/0/07/Derote.png/revision/latest/scale-to-width-down/1000?cb=20260601122629&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/daklak_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "ĐNNRTV1", logo: "https://static.wikia.nocookie.net/ftv/images/a/ae/D51.png/revision/latest/scale-to-width-down/1000?cb=20260601123058&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/dongnai1_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "ĐNNRTV2", logo: "https://static.wikia.nocookie.net/ftv/images/8/85/D62.png/revision/latest/scale-to-width-down/1000?cb=20260601123136&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/dongnai2_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Đồng Nai (ĐNNRTV3)", logo: "https://static.wikia.nocookie.net/ftv/images/a/ae/D51.png/revision/latest/scale-to-width-down/1000?cb=20260601123058&path-prefix=vi", stream: "https://1.org.vn/dnrtv3", qualityBadge: "720p", qualityColor: "bg-orange-500" },
  { category: "Địa phương", name: "Gia Lai (GTV)", logo: "https://static.wikia.nocookie.net/ftv/images/d/db/Gtvc.png/revision/latest/scale-to-width-down/1000?cb=20260601123951&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/gialai01_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Đồng Tháp 1 (THĐT1)", logo: "https://static.wikia.nocookie.net/ftv/images/4/44/D8.png/revision/latest/scale-to-width-down/1000?cb=20260601123433&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/dongthap_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Địa phương", name: "Đồng Tháp 2 (Miền Tây - THĐT2)", logo: "https://static.wikia.nocookie.net/ftv/images/1/14/D9.png/revision/latest/scale-to-width-down/1000?cb=20260601123603&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/dongthaphd_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Địa phương", name: "H1", logo: "https://static.wikia.nocookie.net/ftv/images/4/4e/H1.png/revision/latest/scale-to-width-down/1000?cb=20260602015950&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd2/hanoitv1_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Địa phương", name: "H2", logo: "https://static.wikia.nocookie.net/ftv/images/7/78/H2.png/revision/latest/scale-to-width-down/1000?cb=20260602020231&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd1/hntv2_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Địa phương", name: "Hà Tĩnh (HTTV)", logo: "https://static.wikia.nocookie.net/ftv/images/f/f9/Htinh.png/revision/latest/scale-to-width-down/1000?cb=20260602020455&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/hatinh_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Hải Phòng (THP)", logo: "https://static.wikia.nocookie.net/ftv/images/e/ee/Imagethp.png/revision/latest/scale-to-width-down/1000?cb=20260602020650&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/haiphong_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Hải Phòng 3 (THP3)", logo: "https://static.wikia.nocookie.net/ftv/images/b/bd/Imageg4f3.png/revision/latest/scale-to-width-down/1000?cb=20260602020807&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/haiphongplus_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Huế (HueTV)", logo: "https://static.wikia.nocookie.net/ftv/images/8/8b/Httvv.png/revision/latest/scale-to-width-down/1000?cb=20260602021015&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/hue_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Hưng Yên (HYTV)", logo: "https://static.wikia.nocookie.net/ftv/images/c/c5/Nhanlon.png/revision/latest/scale-to-width-down/1000?cb=20260602021330&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/hungyen_2000.stream/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Khánh Hoà (KTV)", logo: "https://static.wikia.nocookie.net/ftv/images/0/03/K0.png/revision/latest/scale-to-width-down/1000?cb=20260602021528&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/khanhhoa_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Khánh Hoà 1 (KTV1)", logo: "https://static.wikia.nocookie.net/ftv/images/b/bc/K1.png/revision/latest/scale-to-width-down/1000?cb=20260602021704&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/khanhhoa01_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Lai Châu (LTV)", logo: "https://static.wikia.nocookie.net/ftv/images/8/81/Laichou.png/revision/latest/scale-to-width-down/1000?cb=20260602021840&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/laichau_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Lâm Đồng 1 (LTV1)", logo: "https://static.wikia.nocookie.net/ftv/images/a/a2/L%E1%BB%9D_1.png/revision/latest/scale-to-width-down/1000?cb=20260602021949&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/lamdong_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Lâm Đồng 2 (LTV2)", logo: "https://static.wikia.nocookie.net/ftv/images/b/bc/L%E1%BB%9D_2.png/revision/latest/scale-to-width-down/1000?cb=20260602022036&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/lamdong02_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Lạng Sơn (LSTV)", logo: "https://static.wikia.nocookie.net/ftv/images/e/e0/L%E1%BB%9D_s%E1%BB%9D_t%E1%BB%9D_v%E1%BB%9D.png/revision/latest/scale-to-width-down/1000?cb=20260602022221&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/langson_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Lào Cai (THLC)", logo: "https://static.wikia.nocookie.net/ftv/images/2/2d/Thlc.png/revision/latest/scale-to-width-down/1000?cb=20260602022338&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/laocai_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Nghệ An (NTV)", logo: "https://img-zlr1.tv360.vn/image1/2020_09_23/1600821989411/75bfb004e210_640_360.png", stream: "https://live.fptplay53.net/fnxsd1/nghean_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Ninh Bình (NBTV)", logo: "https://static.wikia.nocookie.net/ftv/images/4/49/Truyenhinhninhbinh.png/revision/latest/scale-to-width-down/1000?cb=20260602022536&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/ninhbinh_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Phú Thọ (PTV)", logo: "https://static.wikia.nocookie.net/ftv/images/0/0a/Hoabinh.png/revision/latest/scale-to-width-down/1000?cb=20260602022805&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/phutho_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Quảng Trị (QTTV)", logo: "https://static.wikia.nocookie.net/ftv/images/b/bf/Imageqtvv.png/revision/latest/scale-to-width-down/1000?cb=20260602023509&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/quangtri_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Quảng Ngãi 1 (QNgTV1)", logo: "https://static.wikia.nocookie.net/logos/images/0/05/QNgTV1.png/revision/latest/scale-to-width-down/200?cb=20260114143704&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/quangngai_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Quảng Ngãi 2 (QNgTV2)", logo: "https://static.wikia.nocookie.net/logos/images/d/da/QNgTV2.png/revision/latest/scale-to-width-down/200?cb=20260114143705&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/quangngai01_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Quảng Ninh 1 (QTV1)", logo: "https://static.wikia.nocookie.net/logos/images/a/a9/QTV1.png/revision/latest?cb=20230527102010&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/quangninh1_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Quảng Ninh 3 (QTV3)", logo: "https://static.wikia.nocookie.net/ftv/images/2/21/Q3.png/revision/latest/scale-to-width-down/1000?cb=20260602023204&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/quangninh3_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Sơn La (STV)", logo: "https://static.wikia.nocookie.net/ftv/images/d/da/Son.png/revision/latest/scale-to-width-down/1000?cb=20260602023810&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/sonla_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Tuyên Quang (TTV)", logo: "https://static.wikia.nocookie.net/ftv/images/5/5a/Ttv.png/revision/latest/scale-to-width-down/1000?cb=20260602024334&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/tuyenquang_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Thanh Hoá (TTV)", logo: "https://static.wikia.nocookie.net/ftv/images/b/bf/36.png/revision/latest/scale-to-width-down/1000?cb=20260602024506&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/thanhhoa_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Thái Nguyên (TN)", logo: "https://static.wikia.nocookie.net/ftv/images/a/a4/La_che.png/revision/latest/scale-to-width-down/1000?cb=20260602024137&path-prefix=vi", stream: "https://live.fptplay53.net/fnxsd1/thainguyen_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Tây Ninh (TN)", logo: "https://static.wikia.nocookie.net/ftv/images/9/9d/Tntayninh.png/revision/latest/scale-to-width-down/1000?cb=20260602024005&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/tayninh01_hls.smil/chunklist_b2500000.m3u8" },
  { category: "Địa phương", name: "Vĩnh Long 1 (THVL1)", logo: "https://static.wikia.nocookie.net/logos/images/3/32/THVL1_logo_ident_2025.png/revision/latest/scale-to-width-down/1000?cb=20251206083051&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd2/vinhlong1_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Địa phương", name: "Vĩnh Long 2 (THVL2)", logo: "https://static.wikia.nocookie.net/logos/images/9/98/THVL2_logo_ident_2025.png/revision/latest/scale-to-width-down/1000?cb=20251206083053&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd2/vinhlong2_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Địa phương", name: "Vĩnh Long 3 (THVL3)", logo: "https://static.wikia.nocookie.net/logos/images/2/29/THVL3_logo_ident_2025.png/revision/latest/scale-to-width-down/1000?cb=20251206083054&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd2/vinhlong3_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Địa phương", name: "Vĩnh Long 4 (THVL4)", logo: "https://static.wikia.nocookie.net/logos/images/7/7e/THVL4_logo_ident_2025.png/revision/latest/scale-to-width-down/1000?cb=20251206083055&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd2/vinhlong4hd_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Địa phương", name: "Vĩnh Long 5 (THVL5)", logo: "https://static.wikia.nocookie.net/logos/images/3/3b/THVL5_logo_ident_2025.png/revision/latest/scale-to-width-down/1000?cb=20251206083057&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/vinhlong5_vhls.smil/chunklist_b5000000.m3u8" },

  // Thiết yếu
  { category: "Thiết yếu", name: "Truyền hình Công an Nhân dân (ANTV)", logo: "https://img-zlr1.tv360.vn/image1/2020_09_23/1600822516608/b33963dc0df8_640_360.png", stream: "https://live.fptplay53.net/fnxhd2/anninhtv_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Thiết yếu", name: "Truyền hình Quốc phòng Việt Nam (QPVN)", logo: "https://static.wikia.nocookie.net/logos/images/5/5d/QPVN.png/revision/latest/scale-to-width-down/1000?cb=20220827083916&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd2/quocphongvnhd_vhls.smil/chunklist_b5000000.m3u8" },

  // SCTV
  { category: "SCTV", name: "SCTV1 HD", logo: "https://static.wikia.nocookie.net/logos/images/3/3c/SCTV1.png/revision/latest/scale-to-width-down/1000?cb=20201119113949&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv1" },
  { category: "SCTV", name: "SCTV2 HD", logo: "https://static.wikia.nocookie.net/logos/images/6/64/SCTV2.png/revision/latest/scale-to-width-down/1000?cb=20201119114104&path-prefix=vi", stream: "https://liveh12.vtvprime.vn/hls/SCTV2/03.m3u8" },
  { category: "SCTV", name: "SCTV3 HD", logo: "https://static.wikia.nocookie.net/logos/images/4/4a/SCTV3.png/revision/latest/scale-to-width-down/1000?cb=20210819101244&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv3" },
  { category: "SCTV", name: "SCTV4 HD", logo: "https://static.wikia.nocookie.net/logos/images/6/62/SCTV4.png/revision/latest/scale-to-width-down/1000?cb=20240116011558&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv4" },
  { category: "SCTV", name: "SCTV5 HD", logo: "https://static.wikia.nocookie.net/logos/images/e/e7/SCTV5.png/revision/latest/scale-to-width-down/1000?cb=20210819100021&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv5" },
  { category: "SCTV", name: "SCTV6 HD", logo: "https://static.wikia.nocookie.net/logos/images/4/4b/SCTV6.png/revision/latest/scale-to-width-down/1000?cb=20210819100633&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd2/film360_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "SCTV", name: "SCTV7 HD", logo: "https://static.wikia.nocookie.net/logos/images/8/87/SCTV7.png/revision/latest/scale-to-width-down/1000?cb=20210819102155&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv7" },
  { category: "SCTV", name: "SCTV8 HD", logo: "https://static.wikia.nocookie.net/logos/images/0/05/SCTV8.png/revision/latest/scale-to-width-down/1000?cb=20210819103024&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv8" },
  { category: "SCTV", name: "SCTV9 HD", logo: "https://static.wikia.nocookie.net/logos/images/f/f3/SCTV9.png/revision/latest/scale-to-width-down/1000?cb=20210821040105&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv9" },
  { category: "SCTV", name: "SCTV10 HD", logo: "https://static.wikia.nocookie.net/logos/images/c/c0/SCTV10.png/revision/latest/scale-to-width-down/1000?cb=20210819105314&path-prefix=vi", stream: "https://liveh34.vtvprime.vn/hls/SCTV10/01.m3u8" },
  { category: "SCTV", name: "SCTV11 HD", logo: "https://static.wikia.nocookie.net/logos/images/7/7d/SCTV11.png/revision/latest/scale-to-width-down/1000?cb=20210821040108&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv11" },
  { category: "SCTV", name: "SCTV12 HD", logo: "https://static.wikia.nocookie.net/logos/images/5/51/SCTV12.png/revision/latest/scale-to-width-down/1000?cb=20201127035429&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv12" },
  { category: "SCTV", name: "SCTV13 HD", logo: "https://static.wikia.nocookie.net/logos/images/c/c1/SCTV13_logo_2022.png/revision/latest/scale-to-width-down/1000?cb=20230630142130&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv13" },
  { category: "SCTV", name: "SCTV14 HD", logo: "https://static.wikia.nocookie.net/logos/images/1/12/SCTV14_logo_2022.png/revision/latest/scale-to-width-down/1000?cb=20220428035033&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv14" },
  { category: "SCTV", name: "SCTV15 HD", logo: "https://static.wikia.nocookie.net/logos/images/9/92/SCTV15.png/revision/latest/scale-to-width-down/1000?cb=20210820043237&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv15" },
  { category: "SCTV", name: "SCTV16 HD", logo: "https://static.wikia.nocookie.net/logos/images/a/aa/SCTV16.png/revision/latest/scale-to-width-down/1000?cb=20210820043927&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv16" },
  { category: "SCTV", name: "SCTV17 HD", logo: "https://static.wikia.nocookie.net/logos/images/0/0a/SCTV17.png/revision/latest/scale-to-width-down/1000?cb=20210820120340&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv17" },
  { category: "SCTV", name: "SCTV18 HD", logo: "https://static.wikia.nocookie.net/logos/images/c/ca/SCTV18.png/revision/latest/scale-to-width-down/1000?cb=20210820120952&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv18" },
  { category: "SCTV", name: "SCTV19 HD", logo: "https://static.wikia.nocookie.net/logos/images/e/ef/SCTV19.png/revision/latest/scale-to-width-down/1000?cb=20240131141543&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv19" },
  { category: "SCTV", name: "SCTV20 HD", logo: "https://static.wikia.nocookie.net/logos/images/b/b1/SCTV20.png/revision/latest/scale-to-width-down/1000?cb=20210821042852&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv20" },
  { category: "SCTV", name: "SCTV21 HD", logo: "https://static.wikia.nocookie.net/logos/images/9/9f/SCTV21.png/revision/latest/scale-to-width-down/1000?cb=20210821043405&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv21" },
  { category: "SCTV", name: "SCTV22 HD", logo: "https://static.wikia.nocookie.net/logos/images/5/5f/SCTV22.png/revision/latest/scale-to-width-down/1000?cb=20210821035512&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctv22" },
  { category: "SCTV", name: "SCTV Phim", logo: "https://static.wikia.nocookie.net/logos/images/1/12/SCTV_Phim_T%E1%BB%95ng_h%E1%BB%A3p_2020.png/revision/latest?cb=20230323070113&path-prefix=vi", stream: "https://hoiquan.dpdns.org/VTVGo/?sctvphim" },

  // Quốc tế
  { category: "Quốc tế", name: "CNN", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg", stream: "https://d3bp6dwmpbdajl.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-ury0meh5m4nzm/index.m3u8", desc: "CNN INTERANTIONAL NEWS CHANNEL" },
  { category: "Quốc tế", name: "BBC News", logo: "https://upload.wikimedia.org/wikipedia/commons/6/62/BBC_News_2022.svg", stream: "https://stream8.cinerama.uz/1251/tracks-v1a1/mono.m3u8", desc: "BBC WORLD NEWS CHANNEL" },
  { category: "Quốc tế", name: "Discovery Channel HD", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Discovery_Channel_logo.svg", stream: "http://cdn4.skygo.mn/live/disk1/SoutheastAsia/HLSv3-FTA/SoutheastAsia.m3u8", desc: "KÊNH KHOA HỌC KHÁM PHÁ THẾ GIỚI" },
  { category: "Quốc tế", name: "ALJAZEERA", logo: "https://upload.wikimedia.org/wikipedia/en/f/f2/Aljazeera_eng.svg", stream: "https://live-hls-apps-aje-fa.getaj.net/AJE/01.m3u8", desc: "AL JAZEERA ENGLISH NEWS" },
  { category: "Quốc tế", name: "Animal Planet", logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Animal_Planet_logo_2018.svg", stream: "https://tiger-hub.vercel.app@vodzong.mjunoon.tv:8087/streamtest/Animal-Planet-158-3/playlist.m3u8", desc: "KÊNH THẾ GIỚI ĐỘNG VẬT HOANG DÃ" },
  { category: "Quốc tế", name: "ASIAN FOOD NETWORK", logo: "https://static.wikia.nocookie.net/logos/images/a/a2/Asian_Food_Network.png", stream: "https://live.fptplay53.net/fnxhd2/afchd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH ẨM THỰC CHÂU Á" },
  { category: "Quốc tế", name: "Cartoon Network", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Cartoon_Network_logo.svg", stream: "http://cdn4.skygo.mn/live/disk1/Cartoon_Network/HLSv3-FTA/Cartoon_Network.m3u8", desc: "KÊNH HOẠT HÌNH THIẾU NHI" },
  { category: "Quốc tế", name: "KBS World", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f6/KBS_World_2018.svg", stream: "https://live.fptplay53.net/epzhd2/kbs_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH TRUYỀN HÌNH QUỐC TẾ HÀN QUỐC" },
  { category: "Quốc tế", name: "NHK World Japan", logo: "https://upload.wikimedia.org/wikipedia/commons/8/87/NHK_World-Japan_logo.svg", stream: "https://live.fptplay53.net/fnxhd2/nhkworld_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH THÔNG TIN VÀ VĂN HÓA NHẬT BẢN" },
  { category: "Quốc tế", name: "TV5 Monde", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/TV5MONDE_logo.svg", stream: "https://live.fptplay53.net/fnxhd2/tv5_hls.smil/chunklist_b2500000.m3u8", desc: "KÊNH TRUYỀN HÌNH PHÁP QUỐC TẾ" },
  { category: "Quốc tế", name: "CNA", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Channel_NewsAsia_logo.svg", stream: "https://live.fptplay53.net/fnxhd2/newsasia_hls.smil/chunklist_b2500000.m3u8", desc: "CHANNEL NEWS ASIA" },
  { category: "Quốc tế", name: "CNBC", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e3/CNBC_logo.svg", stream: "https://live.fptplay53.net/fnxsd1/cnbc_hls.smil/chunklist_b2500000.m3u8", desc: "KÊNH THÔNG TIN TÀI CHÍNH KINH TẾ" },
  { category: "Quốc tế", name: "KIX HD", logo: "https://static.wikia.nocookie.net/logos/images/0/05/KIX_HD.png", stream: "https://live.fptplay53.net/fnxhd2/kixhd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH PHIM HÀNH ĐỘNG VÀ VÕ THUẬT CHÂU Á" },
  { category: "Quốc tế", name: "Outdoor Channel", logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/Outdoor_Channel_logo.svg", stream: "https://live.fptplay53.net/epzhd2/outdoorfhd_vhls.smil/chunklist_b5000000.m3u8", desc: "KÊNH THỂ THAO VÀ HOẠT ĐỘNG NGOÀI TRỜI" },
  { category: "Quốc tế", name: "tvN", logo: "https://upload.wikimedia.org/wikipedia/commons/b/be/Tvn_logo.svg", stream: "https://d21dxaer0ypwk1.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-a6m2cy2rylsvo-ssai-prd/54ac8e25_eb5a_4f10_ba20_ffb254f0a16c/hls/playlist.m3u8", desc: "KÊNH PHIM VÀ GIẢI TRÍ HÀN QUỐC" },
  { category: "Quốc tế", name: "Warner TV HD", logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Warner_TV_logo.svg", stream: "http://cdn4.skygo.mn/live/disk1/Warner/HLSv3-FTA/Warner.m3u8", desc: "KÊNH PHIM TRUYỆN ĐIỆN ẢNH HOLLYWOOD" },
  { category: "Quốc tế", name: "Extreme Sports", logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/Extreme_Group_Logo.svg", stream: "http://flussonic.mkpnet.ru/tv-1a9441fd32d63873/video.m3u8", desc: "KÊNH THỂ THAO MẠO HIỂM" },
  { category: "Quốc tế", name: "Fashion TV", logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Fashion_TV.svg", stream: "https://stream8.cinerama.uz/1053/tracks-v1a1/mono.m3u8", desc: "KÊNH THỜI TRANG QUỐC TẾ" },
  { category: "Quốc tế", name: "Bloomberg", logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Bloomberg_logo.svg", stream: "https://cdn4.skygo.mn/live/disk1/Bloomberg/HLSv3-FTA/Bloomberg.m3u8", desc: "BLOOMBERG BUSINESS TELEVISION" },
];

export const channels: Channel[] = rawChannels.map(ch => {
  if (ch.category === "Địa phương") {
    return {
      ...ch,
      name: formatLocalChannelName(ch.name)
    };
  }
  return ch;
});
