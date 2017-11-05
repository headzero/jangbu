// need Firebase app before use this.
function DailyManager() {
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
    }

    this.getCompanyList = function (companyListener) {
        // todo : on -> once로 변경후 child_added이벤트를 하나 더 사용한다
        self.database.ref("company").on('value', function (snapshot) {
            var companyList = new Array();
            snapshot.forEach(function (childSnapshot) {
                companyList.push(childSnapshot.val());
            });
            companyList.sort(function (a, b) { // 내림차순
                return a.company_name < b.company_name ? -1 : a.company_name > b.company_name ? 1 : 0;
            });
            companyListener(companyList);
        });
    }

    this.getDailyDataWithCompany = function (companyId, companyOutstanding, date, dataCallback) {
        var month = date.substring(0, 7);
        var dailyRef = self.database.ref("daily/" + month);
        dailyRef.orderByChild('cId').equalTo(companyId)
            .once('value', function (snapshot) {
                var dailyList = new Array();
                snapshot.forEach(function (childSnapshot) {
                    var childData = childSnapshot.val();
                    childData.childKey = childSnapshot.key;
                    dailyList.push(childData);
                });

                dailyList.sort(function (a, b) { // 내림차순
                    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
                });

                dataCallback(dailyList, date, companyOutstanding);
            });
    }

    this.getDailyData = function (date, dateCallback) {
        var month = date.substring(0, 7);
        var dailyRef = self.database.ref("daily/" + month);
        dailyRef.orderByChild("date").equalTo(date)
            .on('value', function (snapshot) { // todo : on -> once;
                var dailyList = new Array();
                snapshot.forEach(function (childSnapshot) {
                    var childData = childSnapshot.val();
                    childData.childKey = childSnapshot.key;
                    dailyList.push(childData);
                });
                dateCallback(dailyList);
            });

        dailyRef.on('child_removed', function (oldSnapshot) {
            self.dailyManagerCallback.removeChild(oldSnapshot.key);
        });
    }

    // 월, 날짜 셀렉터에서 가져온다.
    // companyId, companyName, 잔여 전미수outstandingAccout는 회사정보에서 가져온다.
    // 회사 && 날짜 의 경우 중복으로 예외처리를 할 수 있도록 한다.
    // companydata from companyId;
    // company list . get cId;
    this.writeDailyDataCalculated = function (date, companyId, companyName, ownerName,
        radishCount, radishPrice, radishTotal,
        cabbageCount, cabbagePrice, cabbageTotal,
        etcCount, etcPrice, etcTotal,
        dailyTotal, outstandingAccout, collect, outstandingTotal) {
        var daily = getInt(dailyTotal); //dailyTotal == '' ? 0 : parseInt(dailyTotal);
        var radish = getInt(radishTotal); //radishTotal == '' ? 0 : parseInt(radishTotal);
        var cabbage = getInt(cabbageTotal); //cabbageTotal == '' ? 0 : parseInt(cabbageTotal);
        var etc = getInt(etcTotal); //etcTotal == '' ? 0 : parseInt(etcTotal);
        var discount = daily - (radish + cabbage + etc);
        var month = date.substring(0, 7);

        var dailyKey = self.database.ref('daily/' + month).push().key;
        var targetDailyItem = {
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
        };
        self.database.ref('daily/' + month + '/' + dailyKey).set(targetDailyItem);

        var diff = outstandingTotal - outstandingAccout;
        // 글 작성시 : 미수금 1만, 전미수금 2만 = 차액 -1만만큼 줄어들어야함. 이후 날짜 모두 1만씩 줄어들어야함.
        // 글 작성시 : 미수금 3만, 전미수금 2만 = 차액 1만만큼 증가. 이후 날짜 모두 1만씩 증가.
        var ref = self.database.ref('daily/' + targetDailyItem.month);
        self.updateNextDaysOutstanding(ref, targetDailyItem.cId, targetDailyItem.date, diff, outstandingTotal);
        return false;
    }

    this.removeDailyItem = function (month, targetDailyItem) {
        var outstandingAccount = targetDailyItem.currentOutstandingAccout; // 해당 아이템의 전 미수.
        var currentOutstandingTotal = targetDailyItem.outstandingTotal; // 해당 아이템의 미수금.
        var diff = outstandingAccount - currentOutstandingTotal;
        // 글 삭제시 : 전미수금 2만, 미수금 1만 = 차액 1만만큼 이후 최종 미수금액이 늘어나야함.
        var ref = self.database.ref('daily/' + targetDailyItem.month);
        self.updateNextDaysOutstanding(ref, targetDailyItem.cId, targetDailyItem.date, diff, outstandingAccount);

        self.database.ref('daily/' + month + '/' + targetDailyItem.childKey).remove();
    };

    this.updateDailyData = function (childKey, date, companyId,
        radishCount, radishPrice, radishTotal,
        cabbageCount, cabbagePrice, cabbageTotal,
        etcCount, etcPrice, etcTotal,
        dailyTotal, outstandingAccout, collect, outstandingTotal, oldOutstandingTotal) {
        var discount = getInt(dailyTotal) - (getInt(radishTotal) + getInt(cabbageTotal) + getInt(etcTotal));
        var month = date.substring(0, 7);
        var ref = self.database.ref('daily/' + month);
        ref.child(childKey).update({
            month: month,
            date: date,
            cId: companyId,
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

        var diff = outstandingTotal - oldOutstandingTotal;
        // 수정후 - 수정전, 수정후 2만, 수정전 1만 = 차이는 1만원. 이후 모든 값에 1만원씩 추가해줘야함.
        self.updateNextDaysOutstanding(ref, companyId, date, diff, outstandingTotal);
    };

    // diff만큼 이후 날짜의 전미수, 미수합계를 조정한다.
    // lastOutstandingTotal : 오늘날짜가 마지막인경우 그값을 그대로 사용, 뒤에 다른날짜가 있다면 변경됨.
    this.updateNextDaysOutstanding = function (ref, companyId, updatedDate, diff, lastOutstandingTotal) {
        ref.orderByChild('cId').equalTo(companyId)
            .once('value', function (snapshot) {
                var dailyList = new Array();
                snapshot.forEach(function (childSnapshot) {
                    var childData = childSnapshot.val();
                    childData.childKey = childSnapshot.key;
                    dailyList.push(childData);
                });

                dailyList.sort(function (a, b) { // 오름차순
                    return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
                });
                var updateObject = {};
                var updateCompanyFlag = false;
                for (var i = 0; i < dailyList.length; i++) {
                    var dailyItem = dailyList[i];
                    // 같은날에 2개이상의 데이터가 있는경우 데이터가 꼬일 수 있다.
                    if (dailyItem.date > updatedDate) {
                        updateCompanyFlag = true;
                        lastOutstandingTotal = getInt(dailyItem.outstandingTotal) + diff;
                        updateObject[dailyItem.childKey + '/outstandingTotal'] = lastOutstandingTotal;
                        updateObject[dailyItem.childKey + '/currentOutstandingAccout'] = getInt(dailyItem.currentOutstandingAccout) + diff;
                    }
                }
                ref.update(updateObject);
                // 회사의 미수금액 업데이트.
                var updateValue = lastOutstandingTotal; // 수정, 새로 글 작성시에는 변경없음. 
                // 삭제를 할 때만 diff값을 처리함. (updateCompanyFlag ? lastOutstandingTotal : lastOutstandingTotal + diff);
                self.updateCompanyOutstandingTotal(companyId, updateValue);
            });
    };

    this.updateCompanyOutstandingTotal = function (companyId, outstandingTotal) {
        var updates = {};
        updates['/outstanding_num'] = outstandingTotal;
        self.database.ref('company/' + companyId).update(updates);
    };

}
// todo : 이전 날짜에 전미수 값을 사용할 수 있는 방법???
// todo : search from month || 회사명 || 날짜 범위.
