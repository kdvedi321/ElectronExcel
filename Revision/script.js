const $=require("jquery");
const dialog = require("electron").remote.dialog;
const fs = require("fs");
$(document).ready(function(){
    let db;
    let lsc;
    $("#grid .cell").on("click", function(){
        // perform
        // action
        // console.log("Cell was clicked");
        let rid = Number($(this).attr("rid"))+1;
        let cid = Number($(this).attr("cid"))+65;
        let address = String.fromCharCode(cid) + rid;
        // console.log(rid+" "+cid);
        // to set value of input type element => val set
        $("#address-input").val(address);
        let {rowId, colId} = getRCFromAddr(address);
        const cellObject = db[rowId][colId];
        $("#formula-input").val(cellObject.formula);
        lsc = this;
        if(cellObject.bold){
            $("#bold").addClass("active");
        }else{
            $("#bold").removeClass("active");
        }
        if(cellObject.underline){
            $("#underline").addClass("active");
        }else{
            $("#underline").removeClass("active");
        }
        if(cellObject.italic){
            $("#italic").addClass("active");
        }else{
            $("#italic").removeClass("active");
        }
    })
    $("#bold").on("click", function(){
        $(this).toggleClass("active");
        let {rowId, colId} = getRcFromElem(lsc);
        let cellObject = db[rowId][colId];
        $(lsc).css("font-weight", cellObject.bold ?"normal":"bold");
        cellObject.bold = !cellObject.bold;
    })
    $("#underline").on("click",function(){
        $(this).toggleClass("active");
        let {rowId, colId} = getRcFromElem(lsc);
        let cellObject = db[rowId][colId];
        $(lsc).css("text-decoration", cellObject.underline ? "none":"underline");
        cellObject.underline = !cellObject.underline;
    })
    $("#italic").on("click", function(){
        $(this).toggleClass("active");
        let {rowId, colId} = getRcFromElem(lsc);
        let cellObject = db[rowId][colId];
        $(lsc).css("font-style", cellObject.italic ? "normal":"italic");
        cellObject.italic = !cellObject.italic;
    })
    $("#font-family").on("change", function(){
        let fFam = $(this).val();
        let {rowId, colId} = getRcFromElem(lsc);
        let cellObject =db[rowId][colId];
        $(lsc).css("font-family",fFram);
        cellObject.fontFamily = fFam;
    })
    $("font-size").on("change", function(){
        let fSize = $(this).val();
        let {rowId, colId} = getRcFromElem(lsc);
        let cellObject = db[rowId][colId];
        $(lsc).css("font-size", fSize);
        cellObject.fontSize = fSize;
    })
    $("#b-color").on("change",function(){
        let bcolor = $(this).val();
        let {rowId, colId} = getRcFromElem(lsc);
        let cellObject = db[rowId][colId];
        $(lsc).css("background-color", bcolor);
        cellObject.bColor = bcolor;        
    })
    $("#font-color").on("change", function(){
        let color = $(this).val();
        let {rowId, colId} = getRcFromElem(lsc);
        let cellObject = db[rowId][colId];
        $(lsc).css("color", bcolor);
        cellObject.color = color;                
    })
    $("#grid .cell").on("keyup", function(){
        let height = $(this).height();
        // console.log(height);
        let rowId = $(this).attr("rid");
        let lcArr = $("#left-col .cell");
        let myCol = lcArr[rowId];
        $(myCol).css("height",height);
    })
    $("#cell-container").on("scroll", function(){
        let vs = $(this).scrollTop();
        let hs = $(this).scrollLeft();
        $("#tl-cell,#top-row").css("top",vs);
        $("#tl-cell,#left-col").css("left",hs);
    })
    $(".menu").on("click", function(){
        let optionName = $(this).attr("id");
        $(".menu-options").removeClass("active");
        $(`#${optionName}-menu-options`).addClass("active");
    })
    $("#new").on("click", function(){
        db = [];
        let allRows = $("#grid").find(".row");
        for(let i=0;i<allRows.length;i++){
            let allCellOfarow = $(allRows[i]).find(".cell");
            let row = [];
            for(let j=0;j<allCellOfarow.length;j++){
                $(allCellOfarow[j]).html("");
                let cell = {
                    value: "",
                    formula: "",
                    children: [],
                    parents: [],
                    bold: false,
                    underline: false,
                    italic: false,
                    fontSize:12,
                    fontFamily: "arial",
                    bColor: "black",
                    color: "white"
                };
                row.push(cell);
            }
            db.push(row);
        }
        let allCells = $("#grid .cell");
        $(allCells[0]).trigger("click");
    })
    $("#grid .cell").on("blur", function(){
        let rowId = $(this).attr("rid");
        let colId = $(this).attr("cid");
        let cellObject = db[rowId][colId];
        if(cellObject.value==$(this).html()){
            return;
        }
        if(cellObject.formula){
            removeFormula(cellObject, rowId, colId);
        }
        // to get text of any element except input
        let value = $(this).html();
        // console.log(value);
        updateCell(rowId, colId, value);
        // db[rid][cid] = value;
        // console.log(db);
    })
    $("#open").on("click", async function(){
        // it gives array of file paths os selected file
        let sdb = await dialog.showOpenDialog();
        let buffer = fs.readFileSync(sdb.filePaths[0]);
        console.log(buffer);
        db = JSON.parse(buffer);
        let allRows = $("#grid").find(".row");
        for(let i=0;i<allRows.length;i++){
            let allCellOfarow = $(allRows[i]).find(".cell");
            for(let j=0;j<allCellOfarow.length;j++){
                let cellObject = db[i][j];
                $(allCellOfarow[j]).html(cellObject.value);
                $(allCellOfarow[j]).css("bold",cellObject.bold?"bold":"normal");
                $(allCellOfarow[j]).css("text-decoration",cellObject.underline?"underline":"none");
                $(allCellOfarow[j]).css("font-style",cellObject.italic?"italic":"normal");
                $(allCellOfarow[j]).css("font-size",cellObject.fontSize);
                $(allCellOfarow[j]).css("font-family",cellObject.fontFamily);
                // $(allCellOfarow[j]).css("font-size",cellObject.bold?"bold":"normal");
                $(allCellOfarow[j]).css("color",cellObject.color);
                $(allCellOfarow[j]).css("background-color",cellObject.bColor);
            }
        }
    })
    $("#save").on("click", function(){
        let sdb = dialog.showSaveDialogSync();
        let strData = JSON.stringify(db);
        console.log(sdb);
        // it directly gives pathon which file is to be created
        fs.writeFileSync(sdb, strData);
        console.log("File Saved");
    })
    $("#formula-input").on("blur", function(){
        let formula = $(this).val();
        // console.log(value);
        let cellAddress = $("#address-input").val();
        // coordinates => update ui and db
        // let ans = evaluate(formula);
        let {rowId, colId} = getRCFromAddr(cellAddress);
        let cellObject = db[rowId][colId];
        if(cellObject.formula == $(this).val){
            return;
        }
        // if(checkFormula(cellObject, formula)==false){
        //     console.log("Formula is invalid");
        //     return;
        // };
        if(cellObject.formula){
            removeFormula(cellObject, rowId, colId);
        }
        let ans = evaluate(formula);
        cellObject.formula = formula;
        setUpFormula(rowId, colId, formula, cellObject);
        updateCell(rowId, colId, ans);
    })
    function evaluate(formula){
        // split and iterate over formula
        // ( A1 + A2 )
        let fComp = formula.split(" ");
        // [(,A1,+,A2,)]
        console.log(fComp);
        for(let i=0;i<fComp.length;i++){
            let ascii = fComp[i].charCodeAt(0);
            if(ascii >= 65 && ascii <= 90){
                let {rowId, colId} = getRCFromAddr(fComp[i]);
                let value = db[rowId][colId].value;
                formula = formula.replace(fComp[i], value);
            }
        }
        console.log(formula);
        // get RC of the parent cell
        // Get value from db and replace in formula
        // evaluate the formula
        let ans = eval(formula);
        console.log(formula);
        return ans;
    }
    function setUpFormula(crowId, ccolId, formula, cellObject){
        let fComp = formula.split(" ");
        console.log(fComp);
        for(let i=0;i<fComp.length;i++){
            let ascii = fComp[i].charCodeAt(0);
            if(ascii >= 65 && ascii <= 90){
                let  {rowId, colId} = getRCFromAddr(fComp[i]);
                let parentObj = db[rowId][colId];
                parentObj.children.push({
                   rowId: crowId,
                   colId: ccolId
                })
                cellObject.parents.push({
                    rowId: rowId,
                    colId: colId
                });
            }
        }
    }
    function removeFormula(cellObject, rowId, colId){
        for(let i=0;i<cellObject.parents.length;i++){
            let parentRc = cellObject.parents[i];
            let parentObj = db[parentRc.rowId][parentRc.colId];
            // let newArr = parentObj.children.filter(function(elemRc){
            //     return !(rowId == elemRc.rowId && colId == elemRc.colId);
            // })
            // parentObj.children = newArr;
            let idx = parentObj.children.findIndex(function(elemRc){
                return (rowId == elemRc.rowId && colId == elemRc.colId);
            })
            parentObj.children.splice(idx, 1);
        }
        cellObject.parents = [];
        cellObject.formula = "";
    }
    function updateCell(rowId, colId, ans){
        $(`#grid .cell[rid=${rowId}][cid=${colId}]`).html(ans);
        // $('#grid .cell[rid="+rowId"+"]["+"cid="+colId+"]"').htmls(ans);
        let cellObject = db[rowId][colId];
        cellObject.value = ans;
        for(let i = 0;i<cellObject.children.length;i++){
            let childRc = cellObject.children[i];
            let cObj = db[childRc.rowId][childRc.colId];
            let cAns = evaluate(cObj.formula);
            updateCell(childRc.rowId, childRc.colId, cAns);
        }
    }
    function getRCFromAddr(cellAddress){
        // A1, A11
        let Ascii = cellAddress.charCodeAt(0);
        let colId = Ascii-65;
        let rowId = Number(cellAddress.substring(1))-1;
        let obj = {
            rowId : rowId,
            colId : colId
        }
        return obj;
    }
    function getRcFromElem(elem){
        let rowId = $(elem).attr("rid");
        let colId = $(elem).attr("cid");
    }
    function fn(){
        $("#File").trigger("click");
        $("#new").trigger("click");
    }
    fn();
})