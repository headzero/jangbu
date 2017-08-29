// need Firebase app before use this.
function DailyManager(){
    var self = this;
    this.database;
    this.dailyManagerCallback;
    this.config = {
        apiKey: "AIzaSyDVEonurEpbMwfmBVGKp0jIbOBcv9ukht4",
        authDomain: "jangbu-3af0b.firebaseapp.com",
        databaseURL: "https://jangbu-3af0b.firebaseio.com",
        projectId: "jangbu-3af0b",
        storageBucket: "",
        messagingSenderId: "763168792123"
    };
    this.initManager = function (commonDailyManagerCallback) {
        self.dailyManagerCallback = commonDailyManagerCallback;
        firebase.initializeApp(self.config);    
        self.database = firebase.database();
        var dailyRef = self.database.ref("daily");
        dailyRef.on('child_removed', function(oldSnapshot){
            console.log("childRemoved : ");
            console.log(oldSnapshot.val());
            self.dailyManagerCallback.removeChild(oldSnapshot.key);
        });
    }
    
    this.getCompanyList = function (companyListener) {
        // todo : on -> once로 변경후 child_added이벤트를 하나 더 사용한다
        self.database.ref("company").on('value', function(snapshot) {
            var companyList = new Array();
            snapshot.forEach(function(childSnapshot) {
                companyList.push(childSnapshot.val());
            });
            companyListener(companyList);    
        });
    }
    /*   'value' 는 모든 데이터, 'child_added'는 추가되는 데이터.
     // child_changed 이벤트는 하위 노드가 수정될 때마다 발생
     // child_removed 이벤트는 바로 아래 하위 항목이 삭제될 때 발생
     
    ref.on("child_added", function(snapshot, prevChildKey) {
      var newPost = snapshot.val();
      console.log("Author: " + newPost.author);
      console.log("Title: " + newPost.title);
      console.log("Previous Post ID: " + prevChildKey);
    });
    */
    
    this.getDailyData = function(date, dateCallback){
        self.database.ref("daily").orderByChild("date").equalTo(date)
            .once('value', function(snapshot){
                var dailyList = new Array();
                snapshot.forEach(function(childSnapshot){
                    var childData = childSnapshot.val();
                    childData.childKey = childSnapshot.key;
                    dailyList.push(childData);
                });
                dateCallback(dailyList);
          });
    }

    // 월, 날짜 셀렉터에서 가져온다.
    // companyId, companyName, 잔여 전미수outstandingAccout는 회사정보에서 가져온다.
    // 회사 && 날짜 의 경우 중복으로 예외처리를 할 수 있도록 한다.
    // companydata from companyId;
        // company list . get cId;
    
    
    this.writeDailyDataCalculated = function(date, companyId, companyName, ownerName, 
                                              radishCount, radishPrice, radishTotal, 
                                              cabbageCount, cabbagePrice, cabbageTotal, 
                                              etcCount, etcPrice, etcTotal, 
                                              dailyTotal, outstandingAccout, collect, outstandingTotal) {
        var daily = dailyTotal == '' ? 0 : parseInt(dailyTotal);
        var radish = radishTotal == '' ? 0 : parseInt(radishTotal);
        var cabbage = cabbageTotal == '' ? 0 : parseInt(cabbageTotal);
        var etc = etcTotal == '' ? 0 : parseInt(etcTotal);
        var discount = daily - (radish + cabbage + etc);
        var month = date.substring(0, 7);
        
        var dailyKey = self.database.ref().child('daily').push().key;    
        
        self.database.ref('daily/' + dailyKey).set({
            month: month,
            date: date,
            cId: companyId,
            cName: companyName,
            radishCount: radishCount,
            radishPrice: radishPrice,
            radishTotal: radishTotal,
            cabbageCount: cabbageCount,
            cabbagePrice: cabbagePrice,
            cabbageTotal: cabbageTotal,
            etcCount: etcCount,
            etcPrice: etcPrice,
            etcTotal: etcTotal,
            dailyTotal: dailyTotal,
            currentOutstandingAccout: outstandingAccout, // 현재 시점의 전미수
            discount: discount, // 할인
            collect: collect, // 입금
            outstandingTotal: outstandingTotal // 미수합계. -> 회사 전미술 업데이트 필요.
        });

        self.updateCompanyOutstandingTotal(companyId, outstandingTotal);
        return false;
    }
    
    this.updateCompanyOutstandingTotal = function(companyId, outstandingTotal){
        var updates = {};
        updates['/outstanding_num'] = outstandingTotal;
        self.database.ref('company/' + companyId).update(updates);
    };
    
    this.removeDailyItem = function(childKey){
        self.database.ref('daily/' + childKey).remove();
    };
}
    
    // todo : 업데이트 데이터.

    // todo : search from month || 회사명 || 날짜 범위.
