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


var writerViewInit = function(){
        var calculateRadish = function(){
            radishTotal.value = radishCount.value * radishPrice.value;
            calculateTotal();
            calculateOutstanding();
        };
        var calculateCarbbage = function(){
            cabbageTotal.value = cabbageCount.value * cabbagePrice.value;
            calculateTotal();
            calculateOutstanding();
        };
        var calculateEtc = function(){
            etcTotal.value = etcCount.value * etcPrice.value;
            calculateTotal();
            calculateOutstanding();
        };
        var calculateTotal = function(){
            var radish = radishTotal.value == '' ? 0 : parseInt(radishTotal.value);
            var cabbage = cabbageTotal.value == '' ? 0 : parseInt(cabbageTotal.value);
            var etc = etcTotal.value == '' ? 0 : parseInt(etcTotal.value);
            dailyTotal.value = radish + cabbage + etc;
            if(!unpaidCheck.checked){
                collect.value = dailyTotal.value;    
            }
        };
        var calculateOutstanding = function(){
            var dailyTotalValue = dailyTotal.value == '' ? 0 : parseInt(dailyTotal.value);
            var outstandingValue = outstandingAccout.value == '' ? 0 : parseInt(outstandingAccout.value);
            var collectValue = collect.value == '' ? 0 : parseInt(collect.value);
            outstandingTotal.value = dailyTotalValue + outstandingValue - collectValue;
        };
    
        var resetAllForms = function(){
            dailyWriterForm.reset(); 
            companySelector.disabled = false;
        };
        
        datePicker.valueAsDate = new Date();
        dailyTotal.disabled = true;
        outstandingAccout.disabled = true;
        outstandingTotal.disabled = true;
        
        companySelector.addEventListener('change', function(){
            var currentItemKey = this.options[ this.selectedIndex ].value;
            if(currentItemKey != ''){
                var companyCount = window.currentCompanyList.length;
                for(var i = 0; i < companyCount; i++){
                    var company = window.currentCompanyList[i];
                    if(currentItemKey == company.company_id){
                        companyOwnerName.value = company.boss_name;
                        outstandingAccout.value = company.outstanding_num;
                        break;
                    }
                }
            }
        });
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
        discountHundred.addEventListener('change', function(){
           if(this.checked){
               var currentTotal = dailyTotal.value == '' ? 0 : parseInt(dailyTotal.value);
               dailyTotal.value = currentTotal - (currentTotal % 1000);
               if(!unpaidCheck.checked){
                    collect.value = dailyTotal.value;    
                }
           } else {
               calculateTotal();
           }
        });
        unpaidCheck.addEventListener('change', function(){
            if(this.checked){
                collect.value = 0;
                collect.disabled = true;
                collect.blur = true;
            } else {
                collect.value = dailyTotal.value;
                collect.disabled = false;
                collect.blur = false;
            }
            calculateOutstanding();
        });
        outstandingTotal.addEventListener('click', function(e){
            calculateOutstanding();
        });
        
        document.getElementById('clearForm').addEventListener('click', function(e){
            if(confirm('입력 내용을 지우시겠습니까?')){  
                resetAllForms();
            }
            e.preventDefault();
        });
        document.getElementById('submitForm').addEventListener('click', function(e){
            e.preventDefault();
            console.log(currentDailyList);
            
            // 이 위로는 공통 체크. 아래는 update/write에 따른 분기.
            if(childKeyForUpdate.value != ''){
                console.log("isUpdate");
                updateForm();   
                return;
            }
            
            if(companySelector.value == ''){
                alert('회사를 선택하세요');
                return;
            }
            
            for (var i = 0; i < currentDailyList.length; i++){
                if(companySelector.value == currentDailyList[i].cId){
                    alert("오늘 거래내역이 이미 있습니다.")
                    return;
                }
            }
            
            
            
            writeForm();
            resetAllForms();
        });
    
        var writeForm = function(){
            var companySelectorChilds = companySelector.children;
            dailyManager.writeDailyDataCalculated(datePicker.value, companySelector.value, companySelectorChilds[companySelector.selectedIndex].innerHTML, companyOwnerName.value,
                                                 radishCount.value, radishPrice.value, radishTotal.value,
                                                 cabbageCount.value, cabbagePrice.value, cabbageTotal.value,
                                                 etcCount.value, etcPrice.value, etcTotal.value,
                                                 dailyTotal.value, outstandingAccout.value, collect.value, outstandingTotal.value);
        };
    
        var updateForm = function(){
            dailyManager.updateDailyData(
                datePicker.value, companySelector.value, // cId
                radishCount.value, radishPrice.value, radishTotal.value,
                cabbageCount.value, cabbagePrice.value, cabbageTotal.value,
                etcCount.value, etcPrice.value, etcTotal.value,
                dailyTotal.value, outstandingAccout.value, collect.value, outstandingTotal.value, oldOutstandingTotal.value);
        }
        
    };

var setUpdateForm = function (currentDailyItem, companyItem){
    console.log(currentDailyItem);
    childKeyForUpdate.value = currentDailyItem.childKey;
    datePicker.value = currentDailyItem.date;
    companySelector.value = currentDailyItem.cId;
    companySelector.disabled = true;
    companyOwnerName.value = (companyItem == undefined)? '' : companyItem.boss_name;
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
    // todo : 저장 할 때는 현재 선택된 키를 사용할 수 있도록 수정..
}