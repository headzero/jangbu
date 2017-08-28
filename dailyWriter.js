var dailyWriterForm = document.getElementById('daily_writer');
var datePicker = document.getElementById('datePicker');
var datePicker = document.getElementById('datePicker');
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

this.writerViewInit = function(){
        var calculateRadish = function(){
            radishTotal.value = radishCount.value * radishPrice.value;
            calculateTotal();
        };
        var calculateCarbbage = function(){
            cabbageTotal.value = cabbageCount.value * cabbagePrice.value;
            calculateTotal();
        };
        var calculateEtc = function(){
            etcTotal.value = etcCount.value * etcPrice.value;
            calculateTotal();
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
        
        datePicker.valueAsDate = new Date();
        dailyTotal.disabled = true;
        // todo 복구필요 -> outstandingAccout.disabled = true;
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
                dailyWriterForm.reset();    
            }
            e.preventDefault();
        });
        document.getElementById('submitForm').addEventListener('click', function(e){
            e.preventDefault();
            dailyManager.writeDailyDataCalculated(datePicker.value, companySelector.value, 
                                                  companySelector.getElementsByTagName('option')[companySelector.selectedIndex].innerHTML, companyOwnerName.value,
                                                 radishCount.value, radishPrice.value, radishTotal.value,
                                                 cabbageCount.value, cabbagePrice.value, cabbageTotal.value,
                                                 etcCount.value, etcPrice.value, etcTotal.value,
                                                 dailyTotal.value, outstandingAccout.value, collect.value, outstandingTotal.value);
            dailyWriterForm.reset();
        });
        
    };