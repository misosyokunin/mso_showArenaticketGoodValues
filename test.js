javascript:(async()=>{
"use strict";
/*
┏━━━━━━━━━━━━━━━━━┓
┃ＭＳＯ＿アリーナチケットの価値表示┃
┗━━━━━━━━━━━━━━━━━┛
Developer:
	魚頭男（https://minesweeper.online/ja/player/16842796 ）
Writing:
	魚頭男（https://minesweeper.online/ja/player/16842796 ）

アリーナチケットの価値を計算するのは面倒。
というわけで、ツールを作りました。

=======================================================
このツールはMinesweeper.Online様（https://minesweeper.online/ 、以下「ＭＳＯ」）より公認を受けていない、非公認のものです。
当プログラムは、ＭＳＯ様とは一切関係ございませんので、このプログラムに関する質問・提言等の連絡は魚頭男（https://minesweeper.online/ja/player/16842796 、以下「魚」）までお願いします。
当プログラムについて、ＭＳＯ様に連絡することは絶対にしないでください。
運営者様並びにユーザー様にご迷惑にならないように努めておりますが、万が一のことがありましたら即削除いたします。
=======================================================
*/

/*
＝＝＝＝＝＝＝＝＝【使い方】＝＝＝＝＝＝＝＝＝
このスクリプトを実行して身を任せるだけです。

アリーナチケットの価値を、プレイヤーのステータスに応じて計算します。
取得中にステータスやアイテムの価値を変更できます。

ただし、持っているアリーナチケットの価値しか取得できません。

1チケット辺り最短1秒で取得します
（環境によっては2秒以上掛かるかもしれません）。
（また、中断機能を設けておりますので、無謀な実行でも大丈夫です）。
スクリプト実行中は、できるだけタブの遷移やブラウザをバックグラウンドにしないようにしてください。

なお、他言語でも同じようなことができると思います。
ただ、このスクリプトのままでは動きませんので、適宜変えてください（「ja」や抽出文言）。

*/

/*＝＝＝＝＝＝＝＝＝＝【スクリプト実行確認】＝＝＝＝＝＝＝＝＝＝*/
const TAR_URL = "https://minesweeper.online/ja/arena";
const TAR_TITLE = "アリーナ一覧画面";
if(location.href.includes(TAR_URL)){
	
}else{
	const result = window.confirm(`${TAR_TITLE}ではありません。\n${TAR_TITLE}へ飛びますか？\n（ページ遷移後に再度このスクリプトを実行してください。）`);
	if(result){
		location.href = TAR_URL;
	}else{
		alert(`${TAR_TITLE}（${TAR_URL}）を表示させてください。`);
	}
	return;
}

/*＝＝＝＝＝＝＝＝＝＝【スクリプト実行前定数セット】＝＝＝＝＝＝＝＝＝＝*/
const MyStorage = new class{
	#storagename;
	#datas;
	constructor(){
		this.#storagename = "_魚頭男_S001_datas";
/*
		window.addEventListener("beforeunload", this.save);
*/
		this.load();
	}
	get(key){
		return this.#datas[key];
	}
	set(key, value){
		return this.#datas[key] = value;
	}
	has(key){
		return !!this.#datas[key];
	}
	remove(key){
		delete this.#datas[key];
	}
	save(){
		const savedata = JSON.stringify(this.#datas);
		localStorage.setItem(this.#storagename, savedata);
	}
	load(){
		const loaddata = localStorage.getItem(this.#storagename);
		if(loaddata){
			this.#datas = JSON.parse(loaddata);
		}else{
			this.clear();
		}
	}
	clear(){
		this.#datas = {};
	}
	size(){
		return Object.keys(this.#datas).length;
	}
};

const Wait = {
	waits : [],
	num : -1,
	add(){
		return new Promise((resolve) =>{
			this.num++;
			this.waits[this.num] = resolve;
		});
	},
	release(){
		this.waits[this.num]();
		this.waits[this.num] = "";
		this.num--;
	},
	time(sec){
		return new Promise((resolve) =>{
			setTimeout(function(){resolve();}, sec * 1000);
		});
	},
};

const CONSTANTS = {
	"https://minesweeper.online/img/other/xp.svg": "経験",
	"https://minesweeper.online/img/other/coin.svg": "コイン",
	"https://minesweeper.online/img/other/hp.svg": "名誉ポイント",
	"https://minesweeper.online/img/arena-coins/42.svg": "銅のアリーナコイン",	/*速度*/
	"https://minesweeper.online/img/arena-coins/46.svg": "鉄のアリーナコイン",	/*速度NG*/
	"https://minesweeper.online/img/arena-coins/43.svg": "銀のアリーナコイン",	/*フラグなし*/
	"https://minesweeper.online/img/arena-coins/41.svg": "金のアリーナコイン",	/*効率*/
	"https://minesweeper.online/img/arena-coins/45.svg": "鋼のアリーナコイン",	/*高難易度*/
	"https://minesweeper.online/img/arena-coins/50.svg": "白金のアリーナコイン",	/*ランダム難易度*/
	"https://minesweeper.online/img/arena-coins/44.svg": "ニッケルのアリーナコイン",	/*ハードコア*/
	"https://minesweeper.online/img/arena-coins/49.svg": "亜鉛のアリーナコイン",	/*ハードコアNG*/
	"https://minesweeper.online/img/arena-coins/47.svg": "パラジウムのアリーナコイン",	/*耐久*/
	"https://minesweeper.online/img/arena-coins/48.svg": "チタンのアリーナコイン",	/*ナイトメア*/
	"https://minesweeper.online/img/activity/": "アクティビティ",	/*アクティビティ全般*/
	"https://minesweeper.online/img/candies/": "イベントポイント",	/*イベントポイント全般*/
};

const InitValues = {
	"経験": MyStorage.get("value_経験") ?? 0.06,
	"コイン": MyStorage.get("value_コイン") ?? 1,
	"アクティビティ": MyStorage.get("value_アクティビティ") ?? 0,
	"イベントポイント": MyStorage.get("value_イベントポイント") ?? 40,
	"銅のアリーナコイン": MyStorage.get("value_銅のアリーナコイン") ?? 20,
	"鉄のアリーナコイン": MyStorage.get("value_鉄のアリーナコイン") ?? 20,
	"銀のアリーナコイン": MyStorage.get("value_銀のアリーナコイン") ?? 20,
	"金のアリーナコイン": MyStorage.get("value_金のアリーナコイン") ?? 20,
	"鋼のアリーナコイン": MyStorage.get("value_鋼のアリーナコイン") ?? 20,
	"白金のアリーナコイン": MyStorage.get("value_白金のアリーナコイン") ?? 20,
	"ニッケルのアリーナコイン": MyStorage.get("value_ニッケルのアリーナコイン") ?? 20,
	"亜鉛のアリーナコイン": MyStorage.get("value_亜鉛のアリーナコイン") ?? 20,
	"パラジウムのアリーナコイン": MyStorage.get("value_パラジウムのアリーナコイン") ?? 20,
	"チタンのアリーナコイン": MyStorage.get("value_チタンのアリーナコイン") ?? 20,
	"名誉ポイント": MyStorage.get("value_名誉ポイント") ?? 60,
};
const InitStatus = {
	"経験": MyStorage.get("stat_経験") ?? 200,
	"コイン": MyStorage.get("stat_コイン") ?? 200,
	"アクティビティ": MyStorage.get("stat_アクティビティ") ?? 45,
	"イベントポイント": MyStorage.get("stat_イベントポイント") ?? 65,
	"アリーナコイン": MyStorage.get("stat_アリーナコイン") ?? 45,
};

/*＝＝＝＝＝＝＝＝＝＝【実行前ユーザー入力】＝＝＝＝＝＝＝＝＝＝*/
const bk = document.createElement("div");
bk.style = "position:fixed; top: 0px; left: 0px; background-color: rgba(0, 0, 0, 0.5); width: 100vw; height: 100vh; font-size: 2em; z-index: 10000; display: flex; justify-content: center; align-items: center; flex-direction: column; scrollbar-gutter: unset;";
document.body.append(bk);


/*＝＝＝＝＝＝＝＝＝＝【実行前定数セット】＝＝＝＝＝＝＝＝＝＝*/
const mouseOverEvent = new MouseEvent("mouseover", {
	view: window,
	bubbles: true,
	cancelable: true
});
const mouseOutEvent = new MouseEvent("mouseout", {
	view: window,
	bubbles: true,
	cancelable: true
});

const target = document.body;
const observer = new MutationObserver(async function (mutations) {
	const tar = mutations[0].target;
/*
	console.log(tar);
*/
	if(!tar.className.includes("market_price_")){
		return;
	}
	const popovers = document.querySelectorAll(".custom-popover-content");
	const popover = popovers[popovers.length - 1];
	const divs = popover.querySelectorAll(":scope > div");
	const to = {};
	for(let i = 0; i < divs.length; i++){
		const div = divs[i];
		if(div.textContent.includes("種別：")){
			to["種別"] = div.textContent;
			continue;
		}
		if(div.textContent.includes("報酬：")){
			const to2 = {};
			const spans = div.querySelectorAll(".text-nowrap-inline");
			for(let j = 0; j < spans.length; j++){
				const span = spans[j];
				const src = span.querySelector("img").src;
				const text = span.textContent;
				for(const [key, value] of Object.entries(CONSTANTS)){
					if(src.includes(key)){
						to2[value] = text;
						break;
					}
				}
			}
			to["報酬"] = to2;
			continue;
		}
		if(div.textContent.includes("市場価格：")){
			to["市場価格"] = div.textContent;
			continue;
		}
	}
	putDatas.push(to);
	popover.closest("td").querySelector(".help").dispatchEvent(mouseOutEvent);
	Wait.release();
});
observer.observe(target, {
	characterData: true,	/*テキストノードの変化を監視*/
	childList: true,	/*子ノードの変化を監視*/
	subtree: true,	/*子孫ノードも監視対象に含める*/
});

/*＝＝＝＝＝＝＝＝＝＝【実行中ユーザー入力】＝＝＝＝＝＝＝＝＝＝*/
document.getElementById("__________removeTable")?.remove();
bk.innerText = "アリーナデータを取得しています…\nしばらくお待ちください…";
{
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = "終了する";
	button.addEventListener("click", () => {
		isLooping = false;
	});
	bk.append(button);
}
const progress = document.createElement("progress");
progress.max = document.querySelectorAll("#arena_content span.help").length;
progress.value = 0;
bk.append(progress);
document.body.innerHTML += `<p>${progress.max}</p>`;	/*★*/
{
	function miwl(key, common_id, val, right_text){
		const label = document.createElement("label");
		const left_span = document.createElement("span");
		left_span.textContent = key;
		left_span.style = "flex-grow: 1;";
		label.append(left_span);
		const input = document.createElement("input");
		input.type = "number";
		input.id = `_${common_id}${key}`;
		input.min = 0;
		input.step = 1;
		input.value = val;
		input.style = "flex-shrink: 1;";
		label.append(input);
		const right_span = document.createElement("span");
		right_span.textContent = right_text;
		right_span.style = "flex-shrink: 1;";
		label.append(right_span);
		return label;
	}
	{
		const form = document.createElement("form");
		form.style = "font-size: 16px; display: flex; flex-direction: column; overflow-y: scroll; width: 90%; max-height: 50%;";
		bk.append(form);
		{
			const details = document.createElement("details");
			details.style = "padding: 1em 0px;";
			form.append(details);
			const summary = document.createElement("summary");
			summary.textContent = "装備補正";
			summary.style = "font-size: 1.5em; cursor: pointer; background-color: rgba(255, 0, 255, 0.3);";
			details.append(summary);
			for(const [key, value] of Object.entries(InitStatus)){
				const label = miwl(key, "装備補正：", value, "+%");
				label.style = "display: flex; justify-content: center; margin-right: 10px;";
				details.append(label);
			}
		}
		{
			const details = document.createElement("details");
			details.style = "padding: 1em 0px;";
			form.append(details);
			const summary = document.createElement("summary");
			summary.textContent = "換算値";
			summary.style = "font-size: 1.5em; cursor: pointer; background-color: rgba(255, 0, 255, 0.3);";
			details.append(summary);
			for(const [key, value] of Object.entries(InitValues)){
				const label = miwl(key, "換算値：", value, "mc");
				label.style = "display: flex; justify-content: center;";
				details.append(label);
			}
		}
	}
}

/*＝＝＝＝＝＝＝＝＝＝【データ取得】＝＝＝＝＝＝＝＝＝＝*/
let isLooping = true;
const putDatas = [];

const helps = document.querySelectorAll("#arena_content span.help");
for(let i = 0; i < helps.length; i++){
	const help = helps[i];
	progress.value++;
	if(!help.textContent.includes("L")){
		continue;
	}
document.body.innerHTML += `<p>${help.textContent}</p>`;	/*★*/
	help.dispatchEvent(mouseOverEvent);
	await Wait.add();
	await Wait.time(0.5);
	
	if(!isLooping){
		break;
	}
/*
	if(i > 20){
		break;
	}
*/
}
observer.disconnect();

/*＝＝＝＝＝＝＝＝＝＝【データ表示】＝＝＝＝＝＝＝＝＝＝*/
function sortTable(){
	if(event.target.tagName !== "TH"){
		return;
	}
	if(!event.target.textContent){
		return;
	}
	let func;
	if(event.target.dataset.sorted === "1"){
		event.target.dataset.sorted = "2";
		func = function(td1, td2){
			if(!(isNaN(td1) && isNaN(td2))){
				td1 = Number(td1);
				td2 = Number(td2);
			}
			return td1 < td2;
		}
	}else{
		event.target.dataset.sorted = "1";
		func = function(td1, td2){
			if(!(isNaN(td1) && isNaN(td2))){
				td1 = Number(td1);
				td2 = Number(td2);
			}
			return td1 > td2;
		}
	}
	
	const table = event.currentTarget;
	const ths = table.querySelectorAll("th");
	const thnum = Array.from(ths).findIndex((th) => th === event.target) + 1;
	
	const tbody = table.querySelector("tbody");
	const trs = tbody.getElementsByTagName("tr");
	for(let i = 0; i < trs.length; i++){
		let td1 = trs[i].querySelector(`td:nth-child(${thnum})`);
		for(let j = i + 1; j < trs.length; j++){
			const td2 = trs[j].querySelector(`td:nth-child(${thnum})`);
			const ptd1 = td1.dataset.truenum ?? td1.textContent;
			const ptd2 = td2.dataset.truenum ?? td2.textContent;
			if(func(ptd1, ptd2)){
				td1 = td2;
			}
		}
		const tr = td1.closest("tr");
		if(tr !== trs[i]){
			trs[i].insertAdjacentElement("beforebegin", tr);
		}
	}
}
bk.style = "display: none";
{
	const table = document.createElement("table");
	table.id = "__________removeTable";
	table.style = "border-collapse: collapse; width: 100%;";
	{
		const caption = document.createElement("caption");
		caption.textContent = "アリーナチケット価格とか早見表";
		table.append(caption);
	}
	{
		const thead = document.createElement("thead");
		table.append(thead);
		{
			const tr = document.createElement("tr");
			thead.append(tr);
			{
				const th = document.createElement("th");
				th.textContent = "種別";
				th.style = "border: solid 1px #444; padding: 8px 16px; cursor: pointer;";
				tr.append(th);
			}
			{
				const th = document.createElement("th");
				th.textContent = "市場価格";
				th.style = "border: solid 1px #444; padding: 8px 16px; cursor: pointer;";
				tr.append(th);
			}
			{
				const th = document.createElement("th");
				th.textContent = "＊価値";
				th.style = "border: solid 1px #444; padding: 8px 16px; cursor: pointer;";
				tr.append(th);
			}
			{
				const th = document.createElement("th");
				th.textContent = "＊美味しさ";
				th.style = "border: solid 1px #444; padding: 8px 16px; cursor: pointer;";
				tr.append(th);
			}
		}
	}
	{
		const tbody = document.createElement("tbody");
		table.append(tbody);
		{
			putDatas.forEach((data, index) => {
				let sum = 0;
				for(const [key, value] of Object.entries(data["報酬"])){
					const stat = (() => {
						let rv;
						if(key.includes("アリーナコイン")){
							rv = document.getElementById("_装備補正：アリーナコイン").value
						}else{
							rv = document.getElementById(`_装備補正：${key}`).value;
						}
						return Number(rv);
					})();
					const repval = Number(document.getElementById(`_換算値：${key}`).value);
					let val = value.replace("+", "");
					val = val.replace(/\s/g, "");
					if(val.includes("K")){
						val = val.replace("K", "");
						val = Number(val) * 1000;
					}else{
						val = Number(val);
					}
					
					sum += (val + (val * stat / 100)) * repval;
				}
				let sizyou = data["市場価格"].replace(/.+：/, "");
				sizyou = sizyou.replace(/\s/g, "");
				if(sizyou.includes("K")){
					sizyou = Number(sizyou) * 1000;
				}
				
				
				const tr = document.createElement("tr");
				tbody.append(tr);
				{
					const td = document.createElement("td");
					td.textContent = data["種別"].replace(/.+：/, "");
					td.dataset.truenum = index;
					td.style = "border: solid 1px #444; padding: 8px 16px;";
					tr.append(td);
				}
				{
					const td = document.createElement("td");
					td.textContent = sizyou;
					td.style = "border: solid 1px #444; padding: 8px 16px;";
					tr.append(td);
				}
				{
					const td = document.createElement("td");
					td.textContent = sum;
					td.style = "border: solid 1px #444; padding: 8px 16px;";
					tr.append(td);
				}
				{
					const td = document.createElement("td");
					const num = (sum / sizyou).toFixed(2);
					td.textContent = num;
					let addStyle = "";
					if(num >= 2.0){
						addStyle = "background-color: rgba(0, 255, 0, 0.3);";
					}
					if(num >= 2.5){
						addStyle = "background-color: rgba(255, 255, 0, 0.3);";
					}
					if(num >= 3.0){
						addStyle = "background-color: rgba(255, 0, 0, 0.3);";
					}
					td.style = `border: solid 1px #444; padding: 8px 16px;${addStyle}`;
					tr.append(td);
				}
			});
		}
	}
	table.addEventListener("click", sortTable);
	const tar_table = document.querySelector("#arena_content table");
	tar_table.parentNode.insertBefore(table, tar_table.nextElementSibling);

}

/*＝＝＝＝＝＝＝＝＝＝【終了処理】＝＝＝＝＝＝＝＝＝＝*/
/*次の実行での入力省略のために、入力値をlocalstorageへセット*/
MyStorage.set("value_経験", document.getElementById("_換算値：経験").value);
MyStorage.set("value_コイン", document.getElementById("_換算値：コイン").value);
MyStorage.set("value_アクティビティ", document.getElementById("_換算値：アクティビティ").value);
MyStorage.set("value_イベントポイント", document.getElementById("_換算値：イベントポイント").value);
MyStorage.set("value_銅のアリーナコイン", document.getElementById("_換算値：銅のアリーナコイン").value);
MyStorage.set("value_鉄のアリーナコイン", document.getElementById("_換算値：鉄のアリーナコイン").value);
MyStorage.set("value_銀のアリーナコイン", document.getElementById("_換算値：銀のアリーナコイン").value);
MyStorage.set("value_金のアリーナコイン", document.getElementById("_換算値：金のアリーナコイン").value);
MyStorage.set("value_鋼のアリーナコイン", document.getElementById("_換算値：鋼のアリーナコイン").value);
MyStorage.set("value_白金のアリーナコイン", document.getElementById("_換算値：白金のアリーナコイン").value);
MyStorage.set("value_ニッケルのアリーナコイン", document.getElementById("_換算値：ニッケルのアリーナコイン").value);
MyStorage.set("value_亜鉛のアリーナコイン", document.getElementById("_換算値：亜鉛のアリーナコイン").value);
MyStorage.set("value_パラジウムのアリーナコイン", document.getElementById("_換算値：パラジウムのアリーナコイン").value);
MyStorage.set("value_チタンのアリーナコイン", document.getElementById("_換算値：チタンのアリーナコイン").value);
MyStorage.set("value_名誉ポイント", document.getElementById("_換算値：名誉ポイント").value);
MyStorage.set("stat_経験", document.getElementById("_装備補正：経験").value);
MyStorage.set("stat_コイン", document.getElementById("_装備補正：コイン").value);
MyStorage.set("stat_アクティビティ", document.getElementById("_装備補正：アクティビティ").value);
MyStorage.set("stat_イベントポイント", document.getElementById("_装備補正：イベントポイント").value);
MyStorage.set("stat_アリーナコイン", document.getElementById("_装備補正：アリーナコイン").value);
MyStorage.save();

bk.remove();
/*
console.log(putDatas);
*/

})();
