const $=require("jquery");
const electron = require("electron");
const dialog = require("electron").remote.dialog;
const fs = require("fs");
$(document).ready(
    function(){
        let db;
        let lsc;
        $("#grid .cell").on("click",function(){
            let rid = Number($(this).attr("ri"));
            let cid = Number($(this).attr("ci"));
            let ciAddr= String.fromCharCode(cid+65);
            $("#address-container").val(ciAddr+(rid+1));
            $("#formula-container").val(db[rid][cid].formula);
            // get al the formating from the cellObject
            // add selected class
            // if(!cellObject.bold){
            //     $("#bold").addClass("selected");
            // }
            $(this).addClass("selected");
            if(lsc && lsc != this)
                $(lsc).removeClass("selected");
            lsc = this;
        })
        // $("#grid .cell").on("keyup", function(){
        //     let height = $(this).height();
        //     console.log(height);
        //     let rowId = $(this).attr("rid");
        //     let lcArr = $("#left-col .cell");
        //     let myCol = lcArr[rowId];
        //     $(myCol).height(height);
        // })
        $("#grid-container").on("scroll", function(){
            let scrollX = $(this).scrollLeft();
            let scrollY = $(this).scrollTop();
            console.log(scrollX+" "+scrollY);
            $("#top-left-cell, #left-col").css("left", scrollX + "px");
            $("#top-left-cell, #top-row").css("top", scrollY + "px");
        })
        $(".menu-items").on("click",function(){
            $(".menu-options-item").removeClass("selected");
            let id = $(this).attr("id");
            $(`#${id}-options`).addClass("selected");
        })
        $("#Save").on("click",async function(){
            let sdb =await dialog.showOpenDialog();
            let jsonData = JSON.stringify(db);
            fs.writeFileSync(sdb.filePaths[0],jsonData);
        })

        // let fileSaver = document.querySelector("#File-saver");
        // fileSaver.addEventListener("change", function(){
        //     let fpath = fileSaver.files[0].path;
        //     let jsonData = JSON.stringify(db);
        //     fs.writeFileSync(fpath, jsonData);
        //     console.log("Written file to disk");
        // })
        $("#Open").on("click",async function(){
            let odb = await dialog.showOpenDialog();
            let fp = odb.filePaths[0];
            let content = await fs.promises.readFileSync(fp);
            db = JSON.parse(content);
            let rows = $("#grid").find(".row");
            for(let i=0;i<rows.length;i++){
                let cRowCells = $(rows[i]).find(".cell");
                for(let j=0;j<cRowCells.length;j++){
                    // let rowId = $(cRowCells[j]).attr("ri");
                    // let colId = $(cRowCells[j]).ajaxStart("ci");
                    // $(cRowCells[j]).html(db[i][j].value);
                    let cell = db[i][j];
                    $(cRowCells[j]).html(cell.value);
                    $(cRowCells[j]).html("font-family", cell.fontfamily);
                    $(cRowCells[j]).html("font-size", cell.fontSize + "px");
                    $(cRowCells[j]).html("font-weight", cell.bold ? "bolder":"normal");
                    $(cRowCells[j]).html("font-decoration", cell.underline ? "underline":"none");
                    $(cRowCells[j]).html("font-style", cell.italic ? "italic":"normal");
                    $(cRowCells[j]).html("background-color", cell.bgColor);
                    $(cRowCells[j]).html("color", cell.textColor);
                    $(cRowCells[j]).html("text-align", cell.halign);                    
                }
            }
        })
        $("#New").on("click",function(){
            db=[];
            $("#grid").find(".row").each(function(){
                let row = [];
                $(this).find(".cell").each(function(){
                    let cell = {
                        value : "",
                        formula : "",
                        downstream : [],
                        upstream : [],
                        fontfamily : "Arial",
                        fontSize : 12,
                        bold : false,
                        underline : false,
                        italic : false,
                        textColor : "#000000",
                        bgColor : "white",
                        halign : "left"
                    };
                    // $(this).html("false");
                    row.push(cell);
                    // $(cRowCells[j]).html("");
                    $(this).html("");
                    $(this).html("font-family", cell.fontfamily);
                    $(this).html("font-size", cell.fontSize + "px");
                    $(this).html("font-weight", cell.bold ? "bolder":"normal");
                    $(this).html("font-decoration", cell.underline ? "underline":"none");
                    $(this).html("font-style", cell.italic ? "italic":"normal");
                    $(this).html("background-color", cell.bgColor);
                    $(this).html("color", cell.textColor);
                    $(this).html("text-align", cell.halign);                    
                })
                db.push(row);
            })
            console.log(db);
        })
        // **************Formatting******

        $("#italic").on("click", function(){
            $(this).toggleClass("selected");
            let isItalic = $(this).hasClass("selected");
            $("#grid .cell.selected").css("font-style",isItalic?"italic":"normal");
            let cellElem = $("#grid .cell.selected");
            let {rowId, colId} = getRc(cellElem);
            let cellObject = getCellObject(rowId, colId);
            cellObject.b = isItalic;
        })
        $("#underline").on("click", function(){
            $(this).toggleClass("selected");
            let isunderline = $(this).hasClass("selected");
            $("#grid .cell.selected").css("text-decoration",isunderline?"underline":"none");
            let cellElem = $("#grid .cell.selected");
            let {rowId, colId} = getRc(cellElem);
            let cellObject = getCellObject(rowId, colId);
            cellObject.isunderline = isunderline;
        })
        $("#bold").on("click",function(){
            $(this).toggleClass("selected");
            let isBold = $(this).hasClass("selected");
            $("#grid .cell.selected").css("font-weight",isBold?"bolder":"normal");
            let cellElem = $("#grid .cell.selected")
            let {rowId, colId} = getRc(cellElem);
            let cellObject = getCellObject(rowId, colId);
            cellObject.bold = isBold;
        })
        $("#font-family").on("change",function(){
            let fontFamily = $(this).val();
            console.log(fontFamily);
            $("#grid .cell.selected").css("font-family",fontFamily);
            let cellElem = $("#grid .cell.selected")
            let {rowId, colId} = getRc(cellElem);
            let cellObject = getCellObject(rowId, colId);
            cellObject.fontfamily = fontFamily;
        })
        $("#font-size").on("change",function(){
            let fontSize = $(this).val();
            console.log(fontSize);
            $("#grid .cell.selected").css("font-size",fontSize+"px");
            let cellElem = $("#grid .cell.selected")
            let {rowId, colId} = getRc(cellElem);
            let cellObject = getCellObject(rowId, colId);
            cellObject.fontSize = fontSize;
        })
        // let lsc ;
        $("#grid .cell").on("blur",function(){
            //update db
        //    let rowId =  $(this).attr("ri");
        //    let colId = $(this).attr("ci");
            console.log("cell fn");
            // lsc = this;
            let{rowId, colId} = getRc(this);
            let cellObject = getCellObject(rowId, colId);
            if($(this).html()==cellObject.value){
                return ;
            }
            if(cellObject.formula){
                removeFormula(cellObject, rowId, colId);
            }
            // cellObject.value=$(this).html();
            updateCell(rowId, colId,  $(this).html(), cellObject);
        //    console.log(db);
        })
        $("#formula-container").on("blur",function(){
            // console.log("Blur Event Occurred");
            // console.log("Formula fn");
            // console.log(this);
            // console.log(lsc);            
            // cell
            // set fromula
            // evaluate
            // update cell
            let address = $("#address-container").val();
            // console.log(address);
            let {rowId, colId} = getRCFromAddress(address);
            let cellObject = getCellObject(rowId, colId);
            let formula = $(this).val();
            if(cellObject.formula == $(this).val()){
                return;
            }
            if(cellObject.formula){
                removeFormula(cellObject, rowId, colId);
            }
            cellObject.formula = formula;
            let eValuatedVal = evaluate(cellObject);
            setUPFormula(rowId, colId, formula);
            updateCell(rowId, colId, eValuatedVal, cellObject);
            
            // let eValuatedVal = evaluate();
        })
        function setUPFormula(rowId, colId, formula){
            // parent downstream add
            let cellObject = getCellObject(rowId, colId);
            // cellObject.formula = formula;
            // set yourself to your parent's downstream
            // ( A1 + A2)
            // formula.replace("(","").replace(")","");
            // A1 + A2
            let formulaComponent = formula.split(" ");
            // [(,A1,+,A2,)]
            for(let i=0;i<formulaComponent.length;i++){
                let code = formulaComponent[i].charCodeAt(0);
                if(code >= 65 && code <= 90){
                    let parentRc = getRCFromAddress(formulaComponent[i]);
                    let fparent = db[parentRc.rowId][parentRc.colId];
                    fparent.downstream.push({
                        rowId, colId
                    });
                    cellObject.upstream.push({
                        rowId: parentRc.rowId,
                        colId: parentRc.colId
                    })
                }
            }
        }

        function removeFormula(cellObject, rowId, colId){
            // delete yourself from parents downstream
            // let {rowId, colId} = getRc(element);
            for(let i=0;i<cellObject.upstream.length;i++){
                let suso = cellObject.upstream[i];
                let fuso = db[suso.rowId][suso.colId];
                let fds = fuso.downstream.filter(function(rc){
                    return !(rc.rowId == rowId && rc.colId == colId);
                })
                fuso.downstream = fds;
            }
            cellObject.upstream = [];
            cellObject.formula = "";
        }

        function evaluate(cellObject){
            let formula = cellObject.formula;
            let formulaComponent = formula.split(" ");
            // [(,A1,+,A2,)]
            for(let i=0;i<formulaComponent.length;i++){
                let code = formulaComponent[i].charCodeAt(0);
                if(code >= 65 && code <= 90){
                    let parentRc = getRCFromAddress(formulaComponent[i]);
                    let fparent = db[parentRc.rowId][parentRc.colId];
                    let value = fparent.value;
                    formula = formula.replace(formulaComponent[i], value);
                }
            }
            // (A1 + A2)
            // for(let i=0;i<cellObject.upstream.length;i++){
            //     let suo = cellObject.upstream[i];
            //     let fparentObject = db[suo.rowId][suo.colId];
            //     let val = fparentObject.value;
            //     // formula => replace => 10
            //     let colId = String.fromCharCode(suo.colId + 65);
            //     let rowId = suo.rowId + 1;
            //     let charMeParent = ""+colAlpha + rowNumber;
            //     formula = formula.replace(charMeParent, val);

            // }
            console.log(formula);
            let ans = eval(formula);
            console.log(ans);
            return ans; 
        }
        function getRCFromAddress(address){
            let colId = address.charCodeAt(0) - 65;
            let rowId = Number(address.substring(1)) - 1;
            return {rowId, colId};
        }
        function updateCell(rowId, colId, val, cellObject){
            $(`#grid .cell[ri=${rowId}][ci=${colId}]`).html(val);
            cellObject.value = val;
            // let cellObject = getCellObject(rowId, colId);
            for(let i=0;i<cellObject.downstream.length;i++){
                let sdsorc = cellObject.downstream[i];
                let fdso = db[sdsorc.rowId][sdsorc.colId];
                let eValuatedVal = evaluate(fdso);
                updateCell(sdsorc.rowId, sdsorc.colId, eValuatedVal, fdso);
            }
        }
        function getCellObject(rowId, colId){
            return db[rowId][colId];
        }
        function getRc(elem){
            let rowId = $(elem).attr("ri");
            let colId = $(elem).attr("ci");
            return {
                rowId,
                colId
            }
        }
        function init(){
            $("#File").trigger("click");
            $("#New").click();
            $("#Home").click();
            $("#grid .cell").eq(0).click();
        }
        init();
    }
);