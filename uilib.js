Object.defineProperty(Object.prototype, "nFlags", {
	enumerable: false,
	value: function () { return Object.keys(this).length - 3; }
});

Object.defineProperty(Object.prototype, "hasFlags", {
	enumerable: false,
	value: function () { return !!this.nFlags(); }
});

Object.defineProperty(Object.prototype, "hasFlag", {
	enumerable: false,
	value: function (f) {
		var Obj = this;
		
		if (typeof f == "string") {
			return Obj.hasOwnProperty(f);
		} else { // Assume Array
			return f.some(v => Obj.hasOwnProperty(v));
		}
	}
});

String.prototype.pad = function (n) {
	return [...Array(n + 1 - this.length)].join(" ");
};

String.prototype.appendPad = function (n) {
	return this + this.pad(n);
};


module.exports.obfuscateToken = function (t) {
	return t.substr(0, 6) + "** ... **" + t.substr(t.length - 6, 6);
};

module.exports.preZero = new function (n) {
	return (parseInt(n) < 10 ? "0" : "") + n;
};
