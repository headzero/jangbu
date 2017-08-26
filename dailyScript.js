// need Firebase app before use this.
function DailyManager(){
    this.database;
    this.config = {
        apiKey: "AIzaSyDVEonurEpbMwfmBVGKp0jIbOBcv9ukht4",
        authDomain: "jangbu-3af0b.firebaseapp.com",
        databaseURL: "https://jangbu-3af0b.firebaseio.com",
        projectId: "jangbu-3af0b",
        storageBucket: "",
        messagingSenderId: "763168792123"
    };
    this.initManager = function(){
        firebase.initializeApp(this.config);    
        this.database = firebase.database();
        console.log("initfinish");
    }
    
    this.getCompanyList = function(companyListener){
        var companyList = new Array();
        this.database.ref("company").once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                companyList.push(childSnapshot.val());
            });
            companyListener(companyList);    
        });
    }

    // 월, 날짜 셀렉터에서 가져온다.
    // companyId, companyName, 잔여 전미수outstandingAccout는 회사정보에서 가져온다.
    // 회사 && 날짜 의 경우 중복으로 예외처리를 할 수 있도록 한다.
    this.writeDailyData = function(date, companyId, radishCount, radishPrice, cabbageCount, cabbagePrice, etcCount, etcPrice, dailyTotal, discount, collect) {
        // companydata from companyId;
        // company list . get cId;
        var companyName;
        var outstandingAcocunt;
        var month = date.substring(0, 7);
        var outstandingTotal = outstandingAccout + dailyTotal - discount - collect;

        writeDailyDataCalculated(month, date, companyId, companyName, radishCount, radishPrice, cabbageCount, cabbagePrice, etcCount, etcPrice, dailyTotal, outstandingAccout, discount, collect, outstandingTotal);
    }

    // do not use public
    this.writeDailyDataCalculated = function(month, date, companyId, companyName, radishCount, radishPrice, cabbageCount, cabbagePrice, etcCount, etcPrice, dailyTotal, outstandingAccout, discount, collect, outstandingTotal) {

        var dailyKey = this.database.ref().child('daily').push().key;
        this.database.ref('daily/' + dailyKey).set({
            month: month,
            date: date,
            cId: companyId,
            cName: companyName,
            radishCount: radishCount,
            radishPrice: radishPrice,
            cabbageCount: cabbageCount,
            cabbagePrice: cabbagePrice,
            etcCount: etcCount,
            etcPrice: etcPrice,
            dailyTotal: dailyTotal,
            outstandingAccout: outstandingAccout, // 전미수
            discount: discount, // 할인
            collect: collect, // 입금
            outstandingTotal: outstandingTotal // 미수합계. -> 회사 전미술 업데이트 필요.
        });

        updateCompanyOutstandingTotal(outstandingTotal);
    }
    
    this.updateCompanyOutstandingTotal = function(outstandingTotal){
        var updates = {};
        updates['/outstandingTotal'] = outstandingTotal;
        this.database.ref('company/' + companyId).update(updates);
    };
}
    

    
    // todo : 읽기 from key.

    // todo : 업데이트 데이터.

    // todo : 삭제 from key.

    // todo : 목록구현 from daily

    // todo : search from month || 회사명 || 날짜 범위.
