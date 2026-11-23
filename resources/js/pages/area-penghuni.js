// Data contoh. Nanti diganti data dari basis data dan akun yang sedang masuk.
var USER={nama:"Rina Pratiwi",kamar:"Kamar 3",harga:850000,mulai:"1 Agu 2026",akhir:"31 Jul 2027"};
var BILLS=[
{id:"2026-11",bln:"November 2026",amt:850000,due:"25 Nov 2026",st:"belum"},
{id:"2026-10",bln:"Oktober 2026",amt:850000,due:"25 Okt 2026",st:"lunas",paid:"23 Okt 2026",no:"KW/2026/10/003"},
{id:"2026-09",bln:"September 2026",amt:850000,due:"25 Sep 2026",st:"lunas",paid:"24 Sep 2026",no:"KW/2026/09/003"}
];
var ISSUES=[
{j:"Keran wastafel bocor",d:"Air menetes terus dari sambungan keran.",tgl:"20 Nov 2026",st:1,foto:false},
{j:"Lampu kamar mandi mati",d:"Lampu tidak menyala sejak awal bulan.",tgl:"4 Nov 2026",st:2,foto:true}
];
var ANN=[
{j:"Pemadaman listrik Sabtu, 28 November",p:"PLN menjadwalkan pemadaman pukul 09.00 sampai 13.00. Mohon cas perangkat terlebih dahulu."},
{j:"Jam tamu",p:"Tamu diperbolehkan berkunjung sampai pukul 21.00."}
];
var STL={belum:"Belum dibayar",pending:"Menunggu verifikasi",lunas:"Lunas",ditolak:"Ditolak"};
var ISL=["Baru","Diproses","Selesai"];
var $=function(s){return document.querySelector(s)};
var rp=function(n){return "Rp"+n.toLocaleString("id-ID")};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var view="home",payId=null;

function toast(t){var e=$("#toast");e.textContent=t;e.classList.remove("hidden");clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.add("hidden")},3200)}
function checkFile(f){ // NFR-02: PNG/JPG, maks. 2 MB
 if(!f)return "";
 if(["image/png","image/jpeg"].indexOf(f.type)<0)return "Format file harus PNG atau JPG.";
 if(f.size>2*1024*1024)return "Ukuran file "+(f.size/1048576).toFixed(1).replace(".",",")+" MB. Maksimal 2 MB, kecilkan foto lalu coba lagi.";
 return "";
}
function preview(f,img){var r=new FileReader();r.onload=function(){img.src=r.result;img.classList.remove("hidden")};r.readAsDataURL(f)}

function bill(b,full){
 var a="";
 if(b.st==="belum")a='<button class="btn" data-pay="'+b.id+'">Unggah bukti transfer</button>';
 if(b.st==="ditolak")a='<div class="note"><b>Bukti ditolak.</b> '+esc(b.catatan||"")+'</div><button class="btn" data-pay="'+b.id+'">Unggah ulang bukti</button>';
 if(b.st==="pending")a='<p class="sub">Bukti sudah terkirim. Pemilik akan memeriksanya.</p>';
 if(b.st==="lunas")a='<button class="btn alt" data-kw="'+b.id+'">Lihat kuitansi</button>';
 return '<div class="card"><div class="row"><h2>'+(full?b.bln:"Tagihan "+b.bln)+'</h2><span class="badge b-'+b.st+'">'+STL[b.st]+'</span></div>'
 +'<div class="amt">'+rp(b.amt)+'</div><p class="sub">'+(b.st==="lunas"?"Dibayar "+b.paid:"Jatuh tempo "+b.due)+'</p>'+a+'</div>';
}
function steps(s){return '<div class="steps" aria-label="Status: '+ISL[s]+'">'+ISL.map(function(l,i){return (i?'<b></b>':'')+'<span class="'+(i<=s?"on":"")+'"><i></i>'+l+'</span>'}).join("")+'</div>'}

function render(){
 document.querySelectorAll("#nav button").forEach(function(b){b.setAttribute("aria-current",b.dataset.v===view?"page":"false")});
 var h="";
 if(view==="home"){
  var cur=BILLS.filter(function(b){return b.st!=="lunas"})[0]||BILLS[0];
  h='<div><h1 style="font-size:1.7rem">Halo, '+esc(USER.nama.split(" ")[0])+'</h1><p class="sub">Ringkasan kamar dan tagihan Anda.</p></div>'
  +bill(cur)
  +'<div class="card"><h2>Kamar Anda</h2><dl class="room"><dt>Kamar</dt><dd>'+USER.kamar+'</dd><dt>Sewa</dt><dd>'+rp(USER.harga)+' / bulan</dd><dt>Kontrak</dt><dd>'+USER.mulai+' sampai '+USER.akhir+'</dd></dl></div>'
  +'<div class="card"><h2>Pengumuman</h2>'+ANN.map(function(a){return '<div class="ann"><h3>'+esc(a.j)+'</h3><p>'+esc(a.p)+'</p></div>'}).join("")+'</div>';
 }
 if(view==="bill")h='<h1 style="font-size:1.7rem">Tagihan</h1>'+BILLS.map(function(b){return bill(b,true)}).join("");
 if(view==="issue"){
  h='<div class="row"><h1 style="font-size:1.7rem">Keluhan</h1><button class="btn sm" id="newI">Buat keluhan</button></div>'
  +(ISSUES.length?ISSUES.map(function(i){return '<div class="card"><div class="row"><h2>'+esc(i.j)+'</h2></div><p class="sub">'+esc(i.d)+'</p><p class="sub">Dilaporkan '+i.tgl+(i.foto?' · dengan foto':'')+'</p>'+steps(i.st)+'</div>'}).join(""):'<div class="empty">Belum ada keluhan. Ketuk “Buat keluhan” jika ada fasilitas yang rusak.</div>');
 }
 $("#view").innerHTML=h;window.scrollTo(0,0);
}

$("#lform").addEventListener("submit",function(e){
 e.preventDefault();var er=$("#lerr");
 if(!$("#em").value.trim()||!$("#pw").value){er.textContent="Isi email dan kata sandi.";er.classList.remove("hidden");return}
 $("#login").classList.add("hidden");$("#app").classList.remove("hidden");
 $("#who").textContent=USER.nama+" · "+USER.kamar;render();
});
$("#out").addEventListener("click",function(){$("#app").classList.add("hidden");$("#login").classList.remove("hidden")});
$("#nav").addEventListener("click",function(e){var b=e.target.closest("[data-v]");if(b){view=b.dataset.v;render()}});

$("#view").addEventListener("click",function(e){
 var p=e.target.closest("[data-pay]"),k=e.target.closest("[data-kw]");
 if(e.target.closest("#newI")){$("#fIss").reset();$("#iI").classList.add("hidden");$("#iE").classList.add("hidden");$("#dIss").showModal()}
 if(p){payId=p.dataset.pay;var b=BILLS.filter(function(x){return x.id===payId})[0];$("#pS").textContent=b.bln+" · "+rp(b.amt);$("#fPay").reset();$("#pI").classList.add("hidden");$("#pE").classList.add("hidden");$("#pB").disabled=true;$("#dPay").showModal()}
 if(k){var b2=BILLS.filter(function(x){return x.id===k.dataset.kw})[0];
  $("#kBody").innerHTML='<div class="stamp">LUNAS</div><dl><dt>No. kuitansi</dt><dd>'+b2.no+'</dd><dt>Penghuni</dt><dd>'+esc(USER.nama)+'</dd><dt>Kamar</dt><dd>'+USER.kamar+'</dd><dt>Periode</dt><dd>'+b2.bln+'</dd><dt>Jumlah</dt><dd>'+rp(b2.amt)+'</dd><dt>Dibayar</dt><dd>'+b2.paid+'</dd></dl><p class="sub">Kuitansi ini diterbitkan otomatis setelah pemilik menyetujui pembayaran.</p>';
  $("#dKw").showModal()}
});
document.querySelectorAll("[data-close]").forEach(function(b){b.addEventListener("click",function(){b.closest("dialog").close()})});

$("#pF").addEventListener("change",function(){
 var f=this.files[0],m=checkFile(f),er=$("#pE");
 $("#pB").disabled=!f||!!m;er.textContent=m;er.classList.toggle("hidden",!m);$("#pI").classList.add("hidden");
 if(f&&!m)preview(f,$("#pI"));
});
$("#fPay").addEventListener("submit",function(e){
 e.preventDefault();
 var b=BILLS.filter(function(x){return x.id===payId})[0];b.st="pending";
 $("#dPay").close();toast("Bukti transfer terkirim. Status tagihan: menunggu verifikasi.");render();
});
$("#iF").addEventListener("change",function(){
 var f=this.files[0],m=checkFile(f),er=$("#iE");
 er.textContent=m;er.classList.toggle("hidden",!m);$("#iI").classList.add("hidden");
 if(f&&!m)preview(f,$("#iI"));
});
$("#fIss").addEventListener("submit",function(e){
 e.preventDefault();
 var f=$("#iF").files[0];if(checkFile(f)){$("#iE").classList.remove("hidden");return}
 ISSUES.unshift({j:$("#iJ").value.trim(),d:$("#iD").value.trim(),tgl:"23 Nov 2026",st:0,foto:!!f});
 $("#dIss").close();toast("Keluhan terkirim. Pemilik akan menindaklanjuti.");render();
});
document.querySelectorAll("dialog").forEach(function(d){d.addEventListener("click",function(e){if(e.target===d)d.close()})});
