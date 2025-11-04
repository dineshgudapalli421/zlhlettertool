sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState",
    "sap/ushell/Container"
], function (Controller, JSONModel, MessageBox, Filter, FilterOperator, MessageToast, ValueState, Container) {
    "use strict";
    var l, i, objContracts;
    return Controller.extend("com.sap.lh.bi.zlhlettertool.controller.View1", {
        onInit: function () {
            l = this;
            var model = new JSONModel({
                bIsConTractAccountBusy: false,
                bIsBusy: false,
                adeviceset: [],
                aDevSetToSub: [],
                sLetterSource: "",
                oContractAccVHObj: {
                    sFirstName: "",
                    sLastName: "",
                    sContractAccount: "",
                    sAcountId: ""
                },
                aContracts: [],
                valuehelpList: [],
                aContAcc: [],
                aContAcctoVh: [],
                aSelAccList: [],
                aSelListtoSub: [],
                aSelSubTo: []
            });
            l.getView().setModel(model, "LetterTool");
        },
        onValueHelpDevice: function (e) {
            var model = l.getOwnerComponent().getModel();
            var deviceValue = l.getView().byId("idDev").getValue();
            this._fnOpenDevice();
        },
        _fnOpenDevice: function () {
            if (!this.oMPDialogDevice) {
                this.oMPDialogDevice = this.loadFragment({ name: "com.sap.lh.bi.zlhlettertool.Fragment.DevSetVh" });
            }
            this.oMPDialogDevice.then(function (dialog) {
                this.oDialogDevice = dialog;
                dialog.open();
            }.bind(this));
        },
        onCloseValuehelp: function () {
            this.oDialogDevice.close();
        },
        onSearchValuehelpDevice: function () {
            l._fnOnSearchDevice();
        },
        _fnOnSearchDevice: function () {
            var description = l.getView().byId("idvhDesc").getValue();
            var model = l.getOwnerComponent().getModel();
            var filters = [];
            var filter = new Filter({
                path: "Description",
                operator: FilterOperator.EQ,
                value1: description
            });
            filters.push(filter);
            model.read("/DeviceSet", {
                filters: filters,
                success: function (data, response) {
                    if (data !== " ") {
                        l.getView().getModel("LetterTool").setProperty("/adeviceset", data.results);
                    }
                },
                error: function (error) {
                    var errorMessage;
                    if (error.responseText.startsWith("<")) {
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(error.responseText, "text/xml");
                        errorMessage = xmlDoc.getElementsByTagName("message")[0].childNodes[0].nodeValue;
                    } else {
                        var errorData = error.responseText;
                        var errorJson = JSON.parse(errorData);
                        errorMessage = errorJson.error.message.value;
                    }
                    MessageBox.error(errorMessage);
                }
            });
        },
        onSubmitDevSet: function () {
            var list = l.getView().byId("idListvalue");
            var selectedContexts = list.getSelectedContexts("LetterTool");
            var devSetToSubmit = [];
            var deviceInput = l.getView().byId("idDev");
            if (selectedContexts && selectedContexts.length > 0) {
                selectedContexts.forEach(function (context) {
                    var device = l.getView().getModel("LetterTool").getProperty(context.sPath);
                    deviceInput.addToken(new sap.m.Token({ text: device.DeviceName }));
                });
                l.getView().getModel("LetterTool").setProperty("/aDevSetToSub", devSetToSubmit);
                l.onCloseValuehelp();
            } else {
                var message = "Select the Required Account Details";
                MessageToast.show(message);
            }
            l.onCloseValuehelp();
        },
        onValueHelpContAcc: function (e) {
            l._fnOpenAccountValueHelp();
        },
        _fnOpenAccountValueHelp: function () {
            if (!this.oMPDialog) {
                this.oMPDialog = this.loadFragment({ name: "com.sap.lh.bi.zlhlettertool.Fragment.ContAccVh" });
            }
            this.oMPDialog.then(function (dialog) {
                this.oDialog = dialog;
                this.oDialog.open();
            }.bind(this));
        },
        onPressValuehelp: function () {
            l._fnOnSearchAccount();
        },
        _fnOnSearchAccount: function () {
            var model = l.getOwnerComponent().getModel("IntRecSer");
            var letterToolModel = l.getView().getModel("LetterTool");
            var firstName = letterToolModel.getProperty("/oContractAccVHObj/sFirstName");
            var lastName = letterToolModel.getProperty("/oContractAccVHObj/sLastName");
            var contractAccount = letterToolModel.getProperty("/oContractAccVHObj/sContractAccount");
            var accountId = letterToolModel.getProperty("/oContractAccVHObj/sAcountId");
            letterToolModel.setProperty("/bIsConTractAccountBusy", true);
            model.read("/GetAccounts", {
                urlParameters: {
                    City: "''",
                    Street: "''",
                    HouseNo: "''",
                    Email: "''",
                    Phone: "''",
                    PostalCode: "''",
                    Region: "''",
                    Country: "''",
                    AccountID: "'" + accountId + "'",
                    ContractAccountID: "'" + contractAccount + "'",
                    LastName: "'" + lastName + "'",
                    UserName: "''",
                    FirstName: "'" + firstName + "'",
                    Contact: "''",
                    $expand: "ContractAccounts",
                    $select: "ContractAccounts/ContractAccountID"
                },
                success: function (data, response) {
                    letterToolModel.setProperty("/bIsConTractAccountBusy", false);
                    var accounts = data.results;
                    if (accounts.length) {
                        letterToolModel.setProperty("/valuehelpList", accounts);
                    }
                },
                error: function (error) {
                    var errorMessage;
                    letterToolModel.setProperty("/bIsConTractAccountBusy", false);
                    if (error.responseText.startsWith("<")) {
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(error.responseText, "text/xml");
                        errorMessage = xmlDoc.getElementsByTagName("message")[0].childNodes[0].nodeValue;
                    } else {
                        var errorData = error.responseText;
                        var errorJson = JSON.parse(errorData);
                        errorMessage = errorJson.error.message.value;
                    }
                    MessageBox.error(errorMessage);
                }
            });
        },
        onSubmitContractAccValHelp: async function () {
            debugger;
            objContracts = [];
            var letterToolModel = l.getView().getModel("LetterTool");
            var list = l.getView().byId("idListvalueContAcc");
            var aSelectedItems = list.getSelectedItems();
            var oMultiInput = l.byId("idConAcc");
            oMultiInput.removeAllTokens();
            var objItems = [];
            for (var i = 0; i < aSelectedItems.length; i++) {
                objItems.push(aSelectedItems[i].getProperty('title'));
            }
            objItems.forEach(function (oItem) {
                var oToken = new sap.m.Token({
                    key: oItem,
                    text: oItem
                });
                oMultiInput.addToken(oToken);
            });
            // objItems.forEach(async function (oItem) {
            //     await l.getContracts(oItem);
            // });
            for (const oItem of objItems) {
                const oData = await l.getContracts(oItem);
            }
            letterToolModel.setProperty("/aContracts", objContracts);
            letterToolModel.setProperty("/oContractAccVHObj/sAcountId", "");
            letterToolModel.setProperty("/valuehelpList", [{}]);
            l.onCloseContAccValuehelp();
            // var selectedContext = list.getSelectedContexts("LetterTool")[0].sPath;
            // var selectedAccount = letterToolModel.getProperty(selectedContext);
            // var contractAccountId = selectedAccount.ContractAccounts.results[0].ContractAccountID;
            // l.getContracts(contractAccountId);
            // l.onCloseContAccValuehelp();
            // l.getView().byId("idConAcc").setValue(contractAccountId);
        },
        getContracts: async function (contractAccountId) {
            var model = l.getOwnerComponent().getModel("IntRecSer");
            //var letterToolModel = l.getView().getModel("LetterTool");        
            return new Promise(function (resolve, reject) {
                model.read("/GetAccounts", {
                    urlParameters: {
                        City: "''",
                        Street: "''",
                        HouseNo: "''",
                        Email: "''",
                        Phone: "''",
                        PostalCode: "''",
                        Region: "''",
                        Country: "''",
                        AccountID: "''",
                        ContractAccountID: "'" + contractAccountId + "'",
                        LastName: "''",
                        UserName: "''",
                        FirstName: "''",
                        Contact: "''",
                        $expand: "ContractAccounts,ContractAccounts/Contracts",
                        $select: "ContractAccounts/ContractAccountID,ContractAccounts/Contracts/ContractID"
                    },
                    success: function (data, response) {
                        var contracts = data.results;
                        if (contracts.length) {
                            var oContracts = {};
                            if (contracts[0].ContractAccounts.results[0].Contracts.results.length === 1) {
                                oContracts = { "ContractID": contracts[0].ContractAccounts.results[0].Contracts.results[0].ContractID };
                                objContracts.push(oContracts);
                            }
                            else if (contracts[0].ContractAccounts.results[0].Contracts.results.length > 1) {
                                var oResults = contracts[0].ContractAccounts.results[0].Contracts.results;
                                for (var i = 0; i < oResults.length; i++) {
                                    oContracts = { "ContractID": oResults[i].ContractID };
                                    objContracts.push(oContracts);
                                }
                            }
                            resolve();
                            //letterToolModel.setProperty("/aContracts", contracts[0].ContractAccounts.results[0].Contracts.results);
                        }
                    },
                    error: function (error) {
                        var errorMessage;
                        if (error.responseText.startsWith("<")) {
                            var parser = new DOMParser();
                            var xmlDoc = parser.parseFromString(error.responseText, "text/xml");
                            errorMessage = xmlDoc.getElementsByTagName("message")[0].childNodes[0].nodeValue;
                        } else {
                            var errorData = error.responseText;
                            var errorJson = JSON.parse(errorData);
                            errorMessage = errorJson.error.message.value;
                        }
                        MessageBox.error(errorMessage);
                    }
                });
            });

        },
        onSubmitContAccFrag: function () {
            var letterToolModel = l.getView().getModel("LetterTool");
            var list = l.getView().byId("idListvalueContAcc");
            var selectedContexts = list.getSelectedContexts("LetterTool");
            var selectedAccounts = [];
            var contractInput = l.getView().byId("idConAcc");
            if (selectedContexts && selectedContexts.length > 0) {
                selectedContexts.forEach(function (context) {
                    var account = l.getView().getModel("LetterTool").getProperty(context.sPath);
                    contractInput.addToken(new sap.m.Token({ text: account.ContractAcc }));
                });
                letterToolModel.setProperty("/aSelListtoSub", selectedAccounts);
                l.onCloseContAccValuehelp();
            } else {
                var message = "Select the Required Account Details";
                MessageToast.show(message);
            }
        },
        OnLiveChangeAcc: function () {
            var contractInput = l.getView().byId("idConAcc");
            var contractValue = contractInput.getValue();
            if (contractValue || AcctoValhelp !== "") {
                contractInput.setValueState("None");
            }
        },
        onChangeCorrType: function () {
            var corrTypeInput = l.getView().byId("idCorrType");
            corrTypeInput.setValueState("None");
            corrTypeInput.setValueStateText("");
        },
        onCloseContAccValuehelp: function () {
            var letterToolModel = l.getView().getModel("LetterTool");
            letterToolModel.setProperty("/oContractAccVHObj/sAcountId", "");
            letterToolModel.setProperty("/valuehelpList", [{}]);
            this.oDialog.close();
        },
        onSubmitLetTool: function () {
            debugger;
            var corrTypeInput = l.getView().byId("idCorrType");
            var corrType = corrTypeInput.getValue();
            var contractInput = l.getView().byId("idConAcc");
            var letterToolModel = l.getView().getModel("LetterTool");
            var contractsMultiInput = l.getView().byId("IdContractsMultInput");
            var selectedContracts = contractsMultiInput.getSelectedKeys();
            // var contractAcc = contractInput.getValue();
            var contractAccTokens = contractInput.getTokens();

            var contractList = [];
            var portionList = [];
            var deviceList = [];
            var contracts = letterToolModel.getProperty("/aContracts");
            var selectedContractKeys = contractsMultiInput.getSelectedKeys();
            if (contracts.length && !selectedContractKeys.length) {
                contractsMultiInput.setValueState("Error");
                contractsMultiInput.setValueStateText("Please select contracts");
                return;
            }
            if (!corrType) {
                corrTypeInput.setValueState("Error");
                corrTypeInput.setValueStateText("Please Enter the Value");
                return;
            }
            for (let i = 0; i < contractAccTokens.length; i++) {
                var contractAcc = contractAccTokens[i].getKey();
                var contract = { ContractAcc: contractAcc };
                contractList.push(contract);
            }

            var portionInput = l.getView().byId("idPortio");
            var portionTokens = portionInput.getTokens();
            for (let i = 0; i < portionTokens.length; i++) {
                var portionName = portionInput.getTokens()[i].getKey();
                letterToolModel.setProperty("/aSelListtoSub", portionList);
                var portion = { PortionName: portionName };
                portionList.push(portion);
            }
            var contractNumList = [];
            for (let i = 0; i < selectedContracts.length; i++) {
                var contractNum = { ContractNum: selectedContracts[i] };
                contractNumList.push(contractNum);
            }
            if (contractAcc.length) {
                var payload = {
                    COTYP: corrType,
                    NAVCORRTYPE_CONTRACT: contractNumList,
                    NAVCORRTYPE_CONTRACTACCOUNT: contractList
                };
            } else if (portionTokens.length) {
                var payload = {
                    COTYP: corrType,
                    NAVCORRTYPE_PORTION: portionList
                };
            } else {
                var payload = {
                    COTYP: corrType,
                    NAVCORRTYPE_DEVICE: deviceList
                };
            }
            var model = l.getOwnerComponent().getModel();
            letterToolModel.setProperty("/bIsBusy", true);
            model.create("/CorrTypeSet", payload, {
                success: function (data, response) {
                    letterToolModel.setProperty("/bIsBusy", false);
                    var resourceBundle = l.getOwnerComponent().getModel("i18n").getResourceBundle();
                    var successMessage = resourceBundle.getText("lhIntRecSuceessResponceTxt", []);
                    MessageBox.success(successMessage, {
                        onClose: function () {
                            l._fnResetLetTool();
                            l.getView().byId("idCorrType").setValue("");
                            for (let i = 0; i < contractAcc.length; i++) {
                                var contractInput = l.getView().byId("idConAcc");
                                contractInput.setValue("");
                            }
                            for (let i = 0; i < portionTokens.length; i++) {
                                var portionInput = l.getView().byId("idPortio");
                                portionInput.removeAllTokens();
                            }
                            letterToolModel.setProperty("/aContracts", []);
                        }
                    });
                },
                error: function (error) {
                    var errorMessage;
                    letterToolModel.setProperty("/bIsBusy", false);
                    if (error.responseText.startsWith("<")) {
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(error.responseText, "text/xml");
                        errorMessage = xmlDoc.getElementsByTagName("message")[0].childNodes[0].nodeValue;
                    } else {
                        var errorData = error.responseText;
                        var errorJson = JSON.parse(errorData);
                        errorMessage = errorJson.error.message.value;
                    }
                    MessageBox.error(errorMessage);
                }
            });
        },
        _fnResetLetTool: function () {
            l.getView().byId("idCorrType").setValue("");
            l.getView().byId("idConAcc").setValue("");
            l.getView().byId("IdContractsMultInput").removeAllSelectedItems();
            l.getView().byId("idPortio").removeAllTokens();
        },
        handleSelectionChange: function () {
            var contractsMultiInput = l.getView().byId("IdContractsMultInput");
            contractsMultiInput.setValueState("None");
        },
        onPressCoreTypeDis: function () {
            var navigationService = sap.ushell.Container.getService("Navigation");
            var target = { target: { semanticObject: "CACorrespondence", action: "display" } };
            navigationService.navigate(target, l.getOwnerComponent());
        },
        onSubContAcc: function (e) {
            l.getView().getModel("LetterTool").setProperty("/bIsBusy", true);
            var contractInput = l.getView().byId("idConAcc");
            var contractValue = contractInput.getValue();
            var model = l.getOwnerComponent().getModel();
            model.read("/ContractAccountSet('" + contractValue + "')", {
                success: function (data, response) {
                    if (data.ContractAcc) {
                        contractInput.setValue(data.ContractAcc);
                        l.getContracts(data.ContractAcc);
                    }
                    l.getView().getModel("LetterTool").setProperty("/bIsBusy", false);
                },
                error: function (error) {
                    var errorMessage;
                    l.getView().getModel("LetterTool").setProperty("/bIsBusy", false);
                    if (error.responseText.startsWith("<")) {
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(error.responseText, "text/xml");
                        errorMessage = xmlDoc.getElementsByTagName("message")[0].childNodes[0].nodeValue;
                    } else {
                        var errorData = error.responseText;
                        var errorJson = JSON.parse(errorData);
                        errorMessage = errorJson.error.message.value;
                    }
                    MessageBox.error(errorMessage);
                }
            });
        },
        onSubDevSet: function () {
            var deviceInput = l.getView().byId("idDev");
            var deviceValue = deviceInput.getValue();
            var model = l.getOwnerComponent().getModel();
            model.read("/DeviceSet('" + deviceValue + "')", {
                success: function (data, response) {
                    if (data.DeviceName) {
                        l.getView().getModel("LetterTool").setProperty("/adeviceset", data.results);
                        deviceInput.addToken(new sap.m.Token({ text: data.DeviceName }));
                        deviceInput.setValue("");
                    }
                },
                error: function (error) {
                    var errorMessage;
                    if (error.responseText.startsWith("<")) {
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(error.responseText, "text/xml");
                        errorMessage = xmlDoc.getElementsByTagName("message")[0].childNodes[0].nodeValue;
                    } else {
                        var errorData = error.responseText;
                        var errorJson = JSON.parse(errorData);
                        errorMessage = errorJson.error.message.value;
                    }
                    MessageBox.error(errorMessage);
                }
            });
        },
        onPressLetterId: function (oEvent) {
            var oSource = oEvent.getSource();
            var ovalue = oSource.getProperty('value');
            var sletterId = ovalue ? ovalue : "";
            if (sletterId) {
                var oSource = "/sap/opu/odata/SAP/ZBI_PRINT_PREVIEW_SRV/Print_previewSet('" + sletterId + "')/$value";
                this.getView().getModel("LetterTool").setProperty("/sLetterSource", oSource);
            }
        },
        onPressCoreTypeLegacy: function (oEvent, letterId) {
            if (!this.oSoFormDialog) {
                this.oSoFormDialog = sap.ui.xmlfragment("com.sap.lh.bi.zlhlettertool.Fragment.PDFView", this);
                this.getView().addDependent(this.oSoFormDialog);
            }
            this.oSoFormDialog.open();
        },
        onCloseDialogPDF: function () {
            var letterId = "";
            var newURL = "";
            this.getView().getModel("LetterTool").setProperty("/sLetterSource", newURL);
            this.oSoFormDialog.close();
        }
    });
});