/**
 * 从页面url中根据key获取值
 * @param {string} name 参数key
 * @returns
 */
export function getUrlParam(name) {
	if (!name) {
		return "";
	}
	var hashes = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
	for (var i = 0; i < hashes.length; i++) {
		var hash = hashes[i].split("=");
		if (hash[0].toUpperCase() == name.toUpperCase()) {
			return hash[1];
		}
	}
	return "";
}

export const deepClone = obj => {
	return JSON.parse(JSON.stringify(obj));
};


/**
 * 从数组中随机获取一个元素
 * @param {*} arr
 */
export const getRandomFromArr = arr => {
	return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * 从多个范围中随机获取一个值
 * @param {Array<Array<Number>>} ranges
 */
export const getRandomFromRanges = ranges => {
	let range = getRandomFromArr(ranges);
	return range[0] + Math.floor(Math.random() * (range[1] - range[0]));
};

/**
 * 将路径中重复的正斜杆替换成单个斜杆隔开的字符串
 * @param path 要处理的路径
 * @returns {string} 将/去重后的结果
 */
export const uniqueSlash = path => path.replace(/(https?:\/)|(\/)+/g, "$1$2");

/**
 * 构建机构树
 * @param {*} orgs
 * @param {*} parentId
 * @returns
 */
export const buildOrgTree = (orgs, parentId) => {
	let res = [];
	let childrens = orgs.filter(item => item.parentId == parentId);
	childrens.forEach(children => {
		res.push({
			title: children.displayName,
			value: children.id + "",
			key: children.id + "",
			children: buildOrgTree(orgs, children.id),
		});
	});
	return res;
};

/**绘制验证码图片**/
export const drawPic = id => {
	var canvas = document.getElementById(id);
	var width = canvas.width;
	var height = canvas.height;
	//获取该canvas的2D绘图环境
	var ctx = canvas.getContext("2d");
	ctx.textBaseline = "bottom";
	/**绘制背景色**/
	ctx.fillStyle = randomColor(180, 240);
	//颜色若太深可能导致看不清
	ctx.fillRect(0, 0, width, height);
	/**绘制文字**/
	var str = "ABCEFGHJKLMNPQRSTWXY123456789abcefghjklmnpqrstwxy";
	var code = "";
	//生成四个验证码
	for (var i = 1; i <= 4; i++) {
		var txt = str[randomNum(0, str.length)];
		code = code + txt;
		ctx.fillStyle = randomColor(50, 160);
		//随机生成字体颜色
		ctx.font = randomNum(90, 110) + "px SimHei";
		//随机生成字体大小
		var x = 10 + i * 50;
		var y = randomNum(100, 135);
		var deg = randomNum(-30, 30);
		//修改坐标原点和旋转角度
		ctx.translate(x, y);
		ctx.rotate((deg * Math.PI) / 180);
		ctx.fillText(txt, 0, 0);
		//恢复坐标原点和旋转角度
		ctx.rotate((-deg * Math.PI) / 180);
		ctx.translate(-x, -y);
	}

	/**绘制干扰线**/
	for (var i = 0; i < 3; i++) {
		ctx.strokeStyle = randomColor(40, 180);
		ctx.beginPath();
		ctx.moveTo(randomNum(0, width / 2), randomNum(0, height / 2));
		ctx.lineTo(randomNum(0, width / 2), randomNum(0, height));
		ctx.stroke();
	}
	/**绘制干扰点**/
	for (var i = 0; i < 50; i++) {
		ctx.fillStyle = randomColor(255);
		ctx.beginPath();
		ctx.arc(randomNum(0, width), randomNum(0, height), 1, 0, 2 * Math.PI);
		ctx.fill();
	}
	return code;
};
/**生成一个随机数**/
function randomNum(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}
/**生成一个随机色**/
function randomColor(min, max) {
	var r = randomNum(min, max);
	var g = randomNum(min, max);
	var b = randomNum(min, max);
	return "rgb(" + r + "," + g + "," + b + ")";
}

export const getUUID = () => {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";

	var uuid = s.join("").replace(/-/g, "");
	return uuid;
};

/**
 * 获取热力图颜色等级列表
 * @param {*} max
 * @param {*} min
 * @returns
 */
export const getHeatMapColorLevel = (max, min) => {
	let colors = [
		"RGB(24,253,253)",
		"RGB(27,253,250)",
		"RGB(29,253,248)",
		"RGB(32,253,245)",
		"RGB(34,253,242)",
		"RGB(36,253,240)",
		"RGB(39,253,237)",
		"RGB(41,253,234)",
		"RGB(44,253,231)",
		"RGB(46,253,229)",
		"RGB(49,253,226)",
		"RGB(51,253,223)",
		"RGB(53,253,221)",
		"RGB(56,253,218)",
		"RGB(58,253,215)",
		"RGB(61,253,213)",
		"RGB(63,253,210)",
		"RGB(66,253,207)",
		"RGB(68,253,205)",
		"RGB(71,253,202)",
		"RGB(73,253,199)",
		"RGB(75,253,197)",
		"RGB(78,253,194)",
		"RGB(80,253,191)",
		"RGB(83,253,189)",
		"RGB(85,253,186)",
		"RGB(88,253,183)",
		"RGB(90,253,181)",
		"RGB(92,253,178)",
		"RGB(95,253,175)",
		"RGB(97,253,172)",
		"RGB(100,253,170)",
		"RGB(102,253,167)",
		"RGB(105,253,164)",
		"RGB(107,253,162)",
		"RGB(110,253,159)",
		"RGB(112,253,156)",
		"RGB(114,253,154)",
		"RGB(117,253,151)",
		"RGB(119,253,148)",
		"RGB(122,253,146)",
		"RGB(124,253,143)",
		"RGB(127,253,140)",
		"RGB(129,254,138)",
		"RGB(131,253,135)",
		"RGB(134,254,132)",
		"RGB(136,254,130)",
		"RGB(139,254,127)",
		"RGB(141,254,124)",
		"RGB(144,254,122)",
		"RGB(146,254,119)",
		"RGB(149,254,116)",
		"RGB(151,254,113)",
		"RGB(153,254,111)",
		"RGB(156,254,108)",
		"RGB(158,254,105)",
		"RGB(161,254,103)",
		"RGB(163,254,100)",
		"RGB(166,254,97)",
		"RGB(168,254,95)",
		"RGB(170,254,92)",
		"RGB(173,254,89)",
		"RGB(175,254,87)",
		"RGB(178,254,84)",
		"RGB(180,254,81)",
		"RGB(183,254,79)",
		"RGB(185,254,76)",
		"RGB(188,254,73)",
		"RGB(190,254,71)",
		"RGB(192,254,68)",
		"RGB(195,254,65)",
		"RGB(197,254,63)",
		"RGB(200,254,60)",
		"RGB(202,254,57)",
		"RGB(205,254,54)",
		"RGB(207,254,52)",
		"RGB(209,254,49)",
		"RGB(212,254,47)",
		"RGB(214,254,44)",
		"RGB(217,254,41)",
		"RGB(219,254,38)",
		"RGB(222,254,36)",
		"RGB(224,254,33)",
		"RGB(227,254,30)",
		"RGB(229,254,28)",
		"RGB(231,254,25)",
		"RGB(234,254,22)",
		"RGB(236,254,20)",
		"RGB(239,254,17)",
		"RGB(241,254,14)",
		"RGB(244,254,12)",
		"RGB(246,255,9)",
		"RGB(248,254,6)",
		"RGB(251,255,4)",
		"RGB(253,255,1)",
		"RGB(255,254,0)",
		"RGB(255,253,0)",
		"RGB(255,252,0)",
		"RGB(255,250,0)",
		"RGB(255,249,0)",
		"RGB(255,248,0)",
		"RGB(255,247,0)",
		"RGB(255,245,0)",
		"RGB(255,244,0)",
		"RGB(255,243,0)",
		"RGB(255,242,0)",
		"RGB(255,240,0)",
		"RGB(255,239,0)",
		"RGB(255,238,0)",
		"RGB(255,237,0)",
		"RGB(255,235,0)",
		"RGB(255,234,0)",
		"RGB(255,233,0)",
		"RGB(255,232,0)",
		"RGB(255,230,0)",
		"RGB(255,229,0)",
		"RGB(255,228,0)",
		"RGB(255,227,0)",
		"RGB(255,226,0)",
		"RGB(255,224,0)",
		"RGB(255,223,0)",
		"RGB(255,222,0)",
		"RGB(255,221,0)",
		"RGB(255,219,0)",
		"RGB(255,218,0)",
		"RGB(255,217,0)",
		"RGB(255,216,0)",
		"RGB(255,214,0)",
		"RGB(255,213,0)",
		"RGB(255,212,0)",
		"RGB(255,211,0)",
		"RGB(255,210,0)",
		"RGB(255,208,0)",
		"RGB(255,207,0)",
		"RGB(255,206,0)",
		"RGB(255,205,0)",
		"RGB(255,203,0)",
		"RGB(255,202,0)",
		"RGB(255,201,0)",
		"RGB(255,200,0)",
		"RGB(255,198,0)",
		"RGB(255,197,0)",
		"RGB(255,196,0)",
		"RGB(255,195,0)",
		"RGB(255,193,0)",
		"RGB(255,192,0)",
		"RGB(255,191,0)",
		"RGB(255,190,0)",
		"RGB(255,188,0)",
		"RGB(255,187,0)",
		"RGB(255,186,0)",
		"RGB(255,185,0)",
		"RGB(255,184,0)",
		"RGB(255,182,0)",
		"RGB(255,181,0)",
		"RGB(255,180,0)",
		"RGB(255,179,0)",
		"RGB(255,177,0)",
		"RGB(255,176,0)",
		"RGB(255,175,0)",
		"RGB(255,174,0)",
		"RGB(255,172,0)",
		"RGB(255,171,0)",
		"RGB(255,170,0)",
		"RGB(255,169,0)",
		"RGB(255,168,0)",
		"RGB(255,166,0)",
		"RGB(255,165,0)",
		"RGB(255,164,0)",
		"RGB(255,163,0)",
		"RGB(255,161,0)",
		"RGB(255,160,0)",
		"RGB(255,159,0)",
		"RGB(255,158,0)",
		"RGB(255,156,0)",
		"RGB(255,155,0)",
		"RGB(255,154,0)",
		"RGB(255,153,0)",
		"RGB(255,151,0)",
		"RGB(255,150,0)",
		"RGB(255,149,0)",
		"RGB(255,148,0)",
		"RGB(255,146,0)",
		"RGB(255,145,0)",
		"RGB(255,144,0)",
		"RGB(255,143,0)",
		"RGB(255,142,0)",
		"RGB(255,140,0)",
		"RGB(255,139,0)",
		"RGB(255,138,0)",
		"RGB(255,136,0)",
		"RGB(255,135,0)",
		"RGB(255,134,0)",
		"RGB(255,132,0)",
		"RGB(255,131,0)",
		"RGB(255,129,0)",
		"RGB(255,128,0)",
		"RGB(255,126,0)",
		"RGB(255,125,0)",
		"RGB(255,123,0)",
		"RGB(255,122,0)",
		"RGB(255,120,0)",
		"RGB(255,119,0)",
		"RGB(255,118,0)",
		"RGB(255,116,0)",
		"RGB(255,115,0)",
		"RGB(255,113,0)",
		"RGB(255,112,0)",
		"RGB(255,110,0)",
		"RGB(255,109,0)",
		"RGB(255,107,0)",
		"RGB(255,106,0)",
		"RGB(255,104,0)",
		"RGB(255,103,0)",
		"RGB(255,102,0)",
		"RGB(255,100,0)",
		"RGB(255,99,0)",
		"RGB(255,97,0)",
		"RGB(255,96,0)",
		"RGB(255,94,0)",
		"RGB(255,93,0)",
		"RGB(255,91,0)",
		"RGB(255,90,0)",
		"RGB(255,88,0)",
		"RGB(255,87,0)",
		"RGB(255,86,0)",
		"RGB(255,84,0)",
		"RGB(255,83,0)",
		"RGB(255,81,0)",
		"RGB(255,80,0)",
		"RGB(255,78,0)",
		"RGB(255,77,0)",
		"RGB(255,75,0)",
		"RGB(255,74,0)",
		"RGB(255,72,0)",
		"RGB(255,71,0)",
		"RGB(255,69,0)",
		"RGB(255,68,0)",
		"RGB(255,67,0)",
		"RGB(255,65,0)",
		"RGB(255,64,0)",
		"RGB(255,62,0)",
		"RGB(255,61,0)",
		"RGB(255,59,0)",
		"RGB(255,58,0)",
		"RGB(255,56,0)",
		"RGB(255,55,0)",
		"RGB(255,54,0)",
		"RGB(255,52,0)",
		"RGB(255,51,0)",
		"RGB(255,49,0)",
		"RGB(255,48,0)",
		"RGB(255,46,0)",
		"RGB(255,45,0)",
		"RGB(255,43,0)",
		"RGB(255,42,0)",
	];
	let gap = (max - min) / colors.length;
	let res = [];
	for (let i = 0; i < colors.length; i++) {
		res.push({
			value: min + gap * (i + 1),
			color: colors[i],
		});
	}
	return res;
};

/**
 * 根据数量值获取热力图颜色
 * @param {*} count
 * @param {*} levels
 * @returns
 */
export const getHeatMapColorByCount = (count, levels) => {
	for (let i = 0; i < levels.length; i++) {
		if (count <= levels[i].value) {
			return levels[i].color;
		}
	}
	return levels[levels.length - 1].color;
};

const cArr = [
	{
		mil: 16521,
		cameraId: 54322,
	},
	{
		mil: 16691,
		cameraId: 54362,
	},
	{
		mil: 16691,
		cameraId: 54320,
	},
	{
		mil: 16789,
		cameraId: 54318,
	},
	{
		mil: 16929,
		cameraId: 54316,
	},
	{
		mil: 17069,
		cameraId: 54314,
	},
	{
		mil: 17209,
		cameraId: 54312,
	},
	{
		mil: 17349,
		cameraId: 54310,
	},
	{
		mil: 17489,
		cameraId: 54308,
	},
	{
		mil: 17629,
		cameraId: 54306,
	},
	{
		mil: 17769,
		cameraId: 54304,
	},
	{
		mil: 17909,
		cameraId: 54302,
	},
	{
		mil: 18049,
		cameraId: 54300,
	},
	{
		mil: 18189,
		cameraId: 54298,
	},
	{
		mil: 18329,
		cameraId: 54296,
	},
	{
		mil: 18469,
		cameraId: 54294,
	},
	{
		mil: 18609,
		cameraId: 54292,
	},
	{
		mil: 18749,
		cameraId: 54290,
	},
	{
		mil: 18889,
		cameraId: 54288,
	},
	{
		mil: 19023,
		cameraId: 54286,
	},
	{
		mil: 19023,
		cameraId: 54358,
	},
	{
		mil: 19023,
		cameraId: 54360,
	},
	{
		mil: 19173,
		cameraId: 54284,
	},
];
export const getCameraIdByMil = (mil, count) => {
	let arr = deepClone(cArr);
	// 按差值排序
	arr.sort((a, b) => Math.abs(a.mil - mil) - Math.abs(b.mil - mil));
	let res = arr.splice(0, count);
	return res;
};

export const formatTime = (momentTime) => {
	return momentTime.format('YYYY-MM-DD HH:mm:ss');
}

const province = "鄂";
const city = "ABGHJW";
const alphas = "QWERTYUPASDFGHJKLZXCVBNM"; // 24个字母 + 10个数字
const nums = "1234567890";
String.prototype.replaceChar = function (index, replacement) {
	return this.substring(0, index) + replacement + this.substring(index + 1);
}

export const randomCph = () => {

	let cs = "AAAAA";

	// 5位

	// 2位字母
	let x, y;
	x = Math.floor(Math.random() * 5);
	cs = cs.replaceChar(x, alphas.charAt(Math.floor(Math.random() * alphas.length)));
	y = Math.floor(Math.random() * 5);
	cs = cs.replaceChar(x, alphas.charAt(Math.floor(Math.random() * alphas.length)));


	// 3位数字
	for (let i = 0; i < cs.length; i++) {
		if (i != x && i != y) {
			cs = cs.replaceChar(i, nums.charAt(Math.floor(Math.random() * nums.length)));
		}
	}



	return province + city.charAt(Math.floor(Math.random() * city.length)) + cs;
}