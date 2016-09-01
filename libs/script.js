var medicines = [];
var allPrice = new BigNumber(0);

var firstInvestPerc = new BigNumber(0);
var secondMedGroup = new BigNumber(0);

var tableHead = 
"<table id='dataTable'><tr><th>No</th><th>Nama Obat</th><th>Harga Obat</th><th>Jumlah Pemakaian</th><th>Nilai Investasi</th><th>Persen Investasi</th><th>Persen Kumulatif</th><th>Kelompok ABC</th><th>Hapus?</th></tr>";
var tableContent = "<tr><td colspan='9' align='center'>Tidak ada data</td></tr>";
var tableFoot = "<tr><th colspan='7' id='total'>TOTAL</th><th colspan='2' id='totalVal'>Rp " + allPrice.toFormat(2) + "</th></tr></table>";

var totalDivOpen = "<div id='total'>";
var totalDivClose = "</div>";

function Medicine(name, price, nums) {
	this.name = name;
	this.price = price;
	this.nums = nums;
}

Medicine.prototype = {
	constructor: Medicine,
	print:function (lineNum, investVal, investPerc, cumPerc, prevCumPerc, index) {
		var medGroup = "";
		var groupCThreshold = new BigNumber(90);
		var groupBThreshold = new BigNumber(70);

		console.log(cumPerc.valueOf(), prevCumPerc.valueOf());
		if (cumPerc.greaterThanOrEqualTo(groupCThreshold)) {
			medGroup = "C";
			if (!prevCumPerc.greaterThanOrEqualTo(groupCThreshold) && !cumPerc.minus(groupCThreshold).greaterThanOrEqualTo(1)) {
				medGroup = "B";
			}
		} else if (cumPerc.greaterThanOrEqualTo(groupBThreshold)) {
			medGroup = "B";
			if (!prevCumPerc.greaterThanOrEqualTo(groupBThreshold) && !cumPerc.minus(groupBThreshold).greaterThanOrEqualTo(1)) {
				medGroup = "A";
			}
		} else {
			medGroup = "A";
		}

		var returned = "<tr><td align='center'>" + lineNum + "</td>" + 
		"<td>" + this.name + "</td>" +
		"<td align='center'>Rp " + this.price.toFormat(2) + "</td>" +
		"<td align='center'>" + this.nums + "</td>" +
		"<td align='center'>Rp " + investVal.toFormat(2) + "</td>" +
		"<td align='center'>" + investPerc.toFixed(2) + " %</td>";

		if (index == 0) {
			returned += "<td align='center'></td>" + 
			"<td align='center'>A</td>"
			;
		} else {
			returned += "<td align='center'>" + cumPerc.toFixed(2) + " %</td>" + 
			"<td align='center'>" + medGroup + "</td>"
			;
		}

		return returned + "<td align='center'><button class='remove' id='" + lineNum + "'>Hapus</button></td></tr>"
		;	
	}
}

$(document).ready(function(){
	clearFields();
	$("#data").html(tableHead + tableContent + tableFoot);

	$("#next").click(function() {
		if (!validateInputIntro()) {
    		alert("Isi yang lengkap dulu ya");
    		return;
    	}
		var month = $("#month").val();
		var year = $("#year").val();
		$("#yearMonth").html("TAHUN " + year + " (" + month + ")");

		$("#intro").hide();
		$("#main").fadeIn();
	});

    $(document).on("click", ".remove", function(){
	    var id = this.id;
	    var removed = medicines.slice(id - 1, id);

	    if (!confirm("Hapus obat " + removed[0].name + "?")) {
	    	return;
	    }

	    medicines.splice(id - 1, 1);

	    var removedVal = removed[0].price.times(removed[0].nums)
	    allPrice = allPrice.minus(removedVal);

	    tableContent = printAllMedicines(medicines);
        tableFoot = "<tr><th colspan='7' id='total'>TOTAL</th><th colspan='2' id='totalVal'>Rp " + allPrice.toFormat(2) + "</th></tr></table>";
        $("#data").html(tableHead + tableContent + tableFoot);
	});

    $("#add").click(function(){
    	if (!validateInput()) {
    		alert("Isi yang lengkap dulu ya");
    		return;
    	}
    	if (!validateInputData()) {
    		return;
    	}

    	var medName = $("#medName").val();
    	var medPrice = new BigNumber($("#medPrice").val());
    	var medNums = new BigNumber($("#medNums").val());

    	var newMed = new Medicine(medName, medPrice, medNums);
    	medicines.push(newMed);

    	allPrice = allPrice.plus(medPrice.times(medNums));

    	clearFields();
    	medicines.sort(function(b,a) {
    		return a.price.times(a.nums) - b.price.times(b.nums);
    	});
    	
    	tableContent = printAllMedicines(medicines);
        tableFoot = "<tr><th colspan='7' id='total'>TOTAL</th><th colspan='2' id='totalVal'>Rp " + allPrice.toFormat(2) + "</th></tr></table>";

        $("#data").html(tableHead + tableContent + tableFoot);
    });

    $("#reset").click(function() {
    	if (confirm("Semua data akan hilang setelah reset, lanjut?")) {
    		resetAll();
    	}
    });

    $("#editMonth").click(function() {
    	$("#main").hide();
    	$("#intro").fadeIn();
    });
});


function validateInputIntro() {
	if ($("#month").val() == "" || $("#year").val() == "") {
		return false;
	}
	return true;
}

function validateInput() {
	if ($("#medName").val() == "" || $("#medPrice").val() == "" || $("#medNums").val() == "") {
		return false;
	}
	return true;
}

function validateInputData() {
	try {
		var medPrice = new BigNumber($("#medPrice").val());
    	var medNums = new BigNumber($("#medNums").val());
    	return true;
	} catch (err) {
		alert("Input tidak valid");
	}
}

function printAllMedicines(medicines) {
	if (medicines.length == 0) {
		return "<tr><td colspan='9' align='center'>Tidak ada data</td></tr>";
	}

	var result = "";
	var lineNum = 1;
	var last = new BigNumber(0);

	for (var med in medicines) {
		var investVal = medicines[med].price.times(medicines[med].nums);
		var investPerc = investVal.dividedBy(allPrice).times(100);

		var cumPerc = investPerc.plus(last);
		result += medicines[med].print(lineNum, investVal, investPerc, cumPerc, last, med);
		
		last = cumPerc;
		lineNum++;
	}
	return result + "";
}

function clearFields() {
    $("#medName").val("");
    $("#medPrice").val("");
    $("#medNums").val("");
}

function resetAll() {
	medicines = [];
	allPrice = new BigNumber(0);
	tableContent = "<tr><td colspan='9' align='center'>Tidak ada data</td></tr>";
	tableFoot = "<tr><th colspan='7' id='total'>TOTAL</th><th colspan='2' id='totalVal'>Rp " + allPrice.toFormat(2) + "</th></tr></table>";
	$("#data").html(tableHead + tableContent + tableFoot);
}

function isDecimal(evt) {
	var charCode = (evt.which) ? evt.which : evt.keyCode;
	if (charCode == 8)
		return true;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
    	return false;
    return true;
}