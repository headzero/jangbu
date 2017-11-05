var dailyWriterForm = document.getElementById('daily_writer');
var datePicker = document.getElementById('datePicker');
var childKeyForUpdate = document.getElementById('childKeyForUpdate');
var companySelector = document.getElementById('companySelector');
var companyOwnerName = document.getElementById('companyOwnerName');
var radishCount = document.getElementById('radishCount');
var radishPrice = document.getElementById('radishPrice');
var radishTotal = document.getElementById('radishTotal');
var cabbageCount = document.getElementById('cabbageCount');
var cabbagePrice = document.getElementById('cabbagePrice');
var cabbageTotal = document.getElementById('cabbageTotal');
var etcCount = document.getElementById('etcCount');
var etcPrice = document.getElementById('etcPrice');
var etcTotal = document.getElementById('etcTotal');
var dailyTotal = document.getElementById('dailyTotal');
var discountHundred = document.getElementById('discountHundred');
var unpaidCheck = document.getElementById('unpaid');
var collect = document.getElementById('collect');
var outstandingAccout = document.getElementById('outstandingAccout');
var outstandingTotal = document.getElementById('outstandingTotal');
var oldOutstandingTotal = document.getElementById('oldOutstandingTotal');

var calcRadishTotal = 0;
var calcCarbbageTotal = 0;
var calcEtcTotal = 0;
var calcTotal = 0;
var calcOutstandingTotal = 0;
var calcOldOutstanding = 0;

var writerViewInit = function () {

    var calculateRadish = function () {
        calcRadishTotal = radishCount.value * radishPrice.value;
        radishTotal.value = comma(calcRadishTotal);
        calculateTotal();
        calculateOutstanding();
    };
    var calculateCarbbage = function () {
        calcCarbbageTotal = cabbageCount.value * cabbagePrice.value;
        cabbageTotal.value = comma(calcCarbbageTotal);
        calculateTotal();
        calculateOutstanding();
    };
    var calculateEtc = function () {
        calcEtcTotal = etcCount.value * etcPrice.value;
        etcTotal.value = comma(calcEtcTotal);
        calculateTotal();
        calculateOutstanding();
    };
    var calculateTotal = function () {
        var radish = radishTotal.value == '' ? 0 : parseInt(calcRadishTotal);
        var cabbage = cabbageTotal.value == '' ? 0 : parseInt(calcCarbbageTotal);
        var etc = etcTotal.value == '' ? 0 : parseInt(calcEtcTotal);
        calcTotal = radish + cabbage + etc;
        dailyTotal.value = comma(calcTotal);

        if (!unpaidCheck.checked) {
            collect.value = calcTotal;
        }
    };
    var calculateOutstanding = function () {
        var dailyTotalValue = calcTotal;
        var outstandingValue = calcOldOutstanding;
        var collectValue = collect.value == '' ? 0 : parseInt(collect.value);
        calcOutstandingTotal = parseInt(dailyTotalValue) + parseInt(outstandingValue) - collectValue;
        outstandingTotal.value = comma(calcOutstandingTotal);
    };

    var resetAllForms = function () {
        dailyWriterForm.reset();
        companySelector.disabled = false;
        companySelector.value = '';
        childKeyForUpdate.value = '';
        oldOutstandingTotal.value = 0;
        calcRadishTotal = 0;
        calcRadishTotal = 0;
        calcCarbbageTotal = 0;
        calcEtcTotal = 0;
        calcTotal = 0;
        calcOutstandingTotal = 0;
        calcOldOutstanding = 0;
        inputTargetDailyItemList = undefined;
    };

    datePicker.valueAsDate = new Date();
    radishTotal.disabled = true;
    cabbageTotal.disabled = true;
    etcTotal.disabled = true;
    dailyTotal.disabled = true;
    outstandingAccout.disabled = true;
    outstandingTotal.disabled = true;

    datePicker.addEventListener('change', function () {
        if (inputTargetDailyItemList == undefined || companySelector.value == "") {
            return;
        }
        var lastOutstandingAccount;
        for (var i = 0; i < currentCompanyList.length; i++) {
            if (currentCompanyList[i].company_id == companySelector.value) {
                lastOutstandingAccount = currentCompanyList[i].outstanding_num;
                break;
            }
        }
        if (lastOutstandingAccount == undefined) {
            return;
        }

        findLastOutstanding(inputTargetDailyItemList, datePicker.value, lastOutstandingAccount);

    });
    companySelector.addEventListener('change', function () {
        var currentItemKey = this.options[this.selectedIndex].value;
        if (currentItemKey != '') {
            var companyCount = window.currentCompanyList.length;
            for (var i = 0; i < companyCount; i++) {
                var company = window.currentCompanyList[i];
                if (currentItemKey == company.company_id) {
                    companyOwnerName.value = company.boss_name;
                    dailyManager.getDailyDataWithCompany(company.company_id, company.outstanding_num, datePicker.value, lastOutstandingCallback);
                    break;
                }
            }
        }
    });

    var lastOutstandingCallback = function (dailyList, date, companyOutstanding) {
        inputTargetDailyItemList = dailyList;
        findLastOutstanding(dailyList, date, companyOutstanding);
    };

    var findLastOutstanding = function (dailyList, date, companyOutstanding) {
        var lastOutstandingFromDailyList;
        if (dailyList.length == 0) {
            // 해당 월에 아예 목록이 없는 경우는 현재 회사 전미수금을 사용한다.
            lastOutstandingFromDailyList = companyOutstanding;
        } else if (dailyList.length > 0) {
            if (dailyList[0].date < date) {
                // 이번달 목록중 가장 마지막날이 지정일보다 작으면 회사 미수값을 그대로 사용.
                lastOutstandingFromDailyList = companyOutstanding;
            } else {
                // 하루씩 앞으로 체크하면서 지정일 이전날의 미수금을 전미수로 사용.
                for (var i = 0; i < dailyList.length; i++) {
                    if (dailyList[i].date < date) {
                        lastOutstandingFromDailyList = dailyList[i].outstandingTotal;
                        break;
                    }
                }
                // 그래도 없는경우 목록의 가장 첫날의 전미수를 그 전날의 전미수금으로 사용.
                if (lastOutstandingFromDailyList == undefined) {
                    lastOutstandingFromDailyList = dailyList[dailyList.length - 1].currentOutstandingAccout;
                }
            }
        }


        var lastOutstanding = (lastOutstandingFromDailyList != undefined) ? lastOutstandingFromDailyList : companyOutstanding;

        calcOldOutstanding = lastOutstanding;
        outstandingAccout.value = comma(lastOutstanding);
        outstandingTotal.value = comma(lastOutstanding);
    };

    companyOwnerName.disabled = true;
    radishCount.addEventListener('keyup', calculateRadish);
    radishPrice.addEventListener('keyup', calculateRadish);
    cabbageCount.addEventListener('keyup', calculateCarbbage);
    cabbagePrice.addEventListener('keyup', calculateCarbbage);
    etcCount.addEventListener('keyup', calculateEtc);
    etcPrice.addEventListener('keyup', calculateEtc);
    radishTotal.addEventListener('keyup', calculateTotal);
    cabbageTotal.addEventListener('keyup', calculateTotal);
    etcTotal.addEventListener('keyup', calculateTotal);
    collect.addEventListener('keyup', calculateOutstanding);
    discountHundred.addEventListener('change', function () {
        if (this.checked) {
            var currentTotal = calcTotal;
            calcTotal = currentTotal - (currentTotal % 1000);
            dailyTotal.value = comma(calcTotal);
            if (!unpaidCheck.checked) {
                collect.value = rm_comma(dailyTotal.value);
            }
        } else {
            calculateTotal();
        }
    });
    unpaidCheck.addEventListener('change', function () {
        if (this.checked) {
            collect.value = 0;
            collect.disabled = true;
            collect.blur = true;
        } else {
            collect.value = rm_comma(dailyTotal.value);
            collect.disabled = false;
            collect.blur = false;
        }
        calculateOutstanding();
    });
    outstandingTotal.addEventListener('click', function (e) {
        calculateOutstanding();
    });

    document.getElementById('clearForm').addEventListener('click', function (e) {
        if (confirm('입력 내용을 지우시겠습니까?')) {
            resetAllForms();
        }
        e.preventDefault();
    });
    document.getElementById('submitForm').addEventListener('click', function (e) {
        e.preventDefault();
        console.log(currentDailyList);
        console.log(companySelector.value);

        // 이 위로는 공통 체크. 아래는 update/write에 따른 분기.
        if (childKeyForUpdate.value != '') {
            console.log("isUpdate");
            updateForm();
            resetAllForms();
            return;
        }

        if (companySelector.value == "") {
            alert('회사를 선택하세요');
            return;
        }

        for (var i = 0; i < inputTargetDailyItemList.length; i++) {
            if (datePicker.value == inputTargetDailyItemList[i].date) {
                alert("오늘 거래내역이 이미 있습니다.")
                return;
            }
        }

        writeForm();
        resetAllForms();
    });

    var writeForm = function () {
        var companySelectorChilds = companySelector.children;
        dailyManager.writeDailyDataCalculated(datePicker.value, companySelector.value, companySelectorChilds[companySelector.selectedIndex].innerHTML, companyOwnerName.value,
            radishCount.value, radishPrice.value, calcRadishTotal,
            cabbageCount.value, cabbagePrice.value, calcCarbbageTotal,
            etcCount.value, etcPrice.value, calcEtcTotal,
            calcTotal, calcOldOutstanding, collect.value, calcOutstandingTotal);
    };

    var updateForm = function () {
        dailyManager.updateDailyData(
            childKeyForUpdate.value, datePicker.value, companySelector.value, // cId
            radishCount.value, radishPrice.value, calcRadishTotal,
            cabbageCount.value, cabbagePrice.value, calcCarbbageTotal,
            etcCount.value, etcPrice.value, calcEtcTotal,
            calcTotal, calcOldOutstanding, collect.value, calcOutstandingTotal, oldOutstandingTotal.value);
    }

};

var setUpdateForm = function (currentDailyItem, companyItem) {
    console.log(currentDailyItem);
    childKeyForUpdate.value = currentDailyItem.childKey;
    datePicker.value = currentDailyItem.date;
    companySelector.value = currentDailyItem.cId;
    companySelector.disabled = true;
    companyOwnerName.value = (companyItem == undefined) ? '' : companyItem.boss_name;
    radishCount.value = currentDailyItem.radishCount;
    radishPrice.value = currentDailyItem.radishPrice;
    radishTotal.value = currentDailyItem.radishTotal;
    cabbageCount.value = currentDailyItem.cabbageCount;
    cabbagePrice.value = currentDailyItem.cabbagePrice;
    cabbageTotal.value = currentDailyItem.cabbageTotal;
    etcCount.value = currentDailyItem.etcCount;
    etcPrice.value = currentDailyItem.etcPrice;
    etcTotal.value = currentDailyItem.etcTotal;
    dailyTotal.value = currentDailyItem.dailyTotal;
    collect.value = currentDailyItem.collect;
    outstandingAccout.value = currentDailyItem.currentOutstandingAccout;
    outstandingTotal.value = currentDailyItem.outstandingTotal;
    oldOutstandingTotal.value = currentDailyItem.outstandingTotal;
    calcRadishTotal = currentDailyItem.radishTotal;
    calcCarbbageTotal = currentDailyItem.cabbageTotal;
    calcEtcTotal = currentDailyItem.etcTotal;
    calcTotal = currentDailyItem.dailyTotal;
    calcOutstandingTotal = currentDailyItem.outstandingTotal;
    calcOldOutstanding = currentDailyItem.currentOutstandingAccout;
    // todo : 저장 할 때는 현재 선택된 키를 사용할 수 있도록 수정..
}

function comma(num) {
    var len, point, str;

    num = num + "";
    point = num.length % 3;
    len = num.length;

    str = num.substring(0, point);
    while (point < len) {
        if (str != "") str += ",";
        str += num.substring(point, point + 3);
        point += 3;
    }

    return str;
}

//콤마 삭제
function rm_comma(num) {
    var number = num + "";
    return number.replace(",", "");
}
