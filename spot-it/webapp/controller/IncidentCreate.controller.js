sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
],
function (Controller,MessageBox) {
    "use strict";

    return Controller.extend("com.abp.spotit.controller.IncidentCreate", {
        onInit: function () {
            // Initialize properties for various selections and states
            var oModel = new sap.ui.model.json.JSONModel({
                selectedSecurity: false,
                selectedEnvironment: false,
                selectedHealthy: false,
                selectedMarine: false,
                what3words: "",
                mapVisible: false,
                selectedFiles: [],
                incidentType: "Incident",

            });

            // Set the model to the view
            this.getView().setModel(oModel);

            var oModel = this.getView().getModel();
            oModel.setProperty("/isObservation", false);
        },
        onSelectionChange: function (oEvent) {
            var selectedKey = oEvent.getParameter("selectedItem").getKey();
            var oModel = this.getView().getModel();
            oModel.setProperty("/incidentType", selectedKey);

            if (selectedKey === "observation") {
                oModel.setProperty("/isObservation", true);
            } else {
                oModel.setProperty("/isObservation", false);
            }
        },
        onSecuritySelect: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            var oModel = this.getView().getModel();

            // Update model property for Security checkbox
            oModel.setProperty("/selectedSecurity", bSelected);

            // Enable/disable other checkboxes based on Security checkbox state
            var bEnableOthers = !bSelected;
            this.byId("Environment").setEnabled(bEnableOthers);
            this.byId("Healthy").setEnabled(bEnableOthers);
            this.byId("Marine").setEnabled(bEnableOthers);
        },

        onClassificationSelect: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            var sSourceId = oEvent.getSource().getId();
            var oModel = this.getView().getModel();

            // Update model property for the clicked classification checkbox
            switch (sSourceId) {
                case this.createId("Environment"):
                    oModel.setProperty("/selectedEnvironment", bSelected);
                    break;
                case this.createId("Healthy"):
                    oModel.setProperty("/selectedHealthy", bSelected);
                    break;
                case this.createId("Marine"):
                    oModel.setProperty("/selectedMarine", bSelected);
                    break;
                default:
                    break;
            }

            // Check if all checkboxes are unchecked
            var bAllUnchecked = !oModel.getProperty("/selectedEnvironment") &&
                !oModel.getProperty("/selectedHealthy") &&
                !oModel.getProperty("/selectedMarine");

            // Enable Security checkbox only if all other checkboxes are unchecked
            this.byId("Security").setEnabled(bAllUnchecked);
        },

        onWhat3WordsLinkPress: function () {
            var sWhat3Words = this.getView().getModel().getProperty("/what3words");
            var sIframeContent = '<iframe src="https://w3w.co/toddler.geologist.animated' + sWhat3Words + '?maptype=satellite&zoom=18" width="100%" height="400px" style="border:none;"></iframe>';
            this.getView().byId("w3wMap").setContent(sIframeContent);

            // Update the model to show the hide button
            this.getView().getModel().setProperty("/mapVisible", true);
        },

        onHideMapPress: function () {
            this.getView().byId("w3wMap").setContent("");

            // Update the model to hide the hide button
            this.getView().getModel().setProperty("/mapVisible", false);
        },


        // onFileUploaderChange: function (oEvent) {
        //     // Get the files from the event
        //     var aFiles = oEvent.getParameter("files");
        //     var oModel = this.getView().getModel();

        //     // Get the current files list from the model
        //     var aCurrentFiles = oModel.getProperty("/files") || [];

        //     // Prepare new files array to append
        //     var aNewFiles = [];
        //     for (var i = 0; i < aFiles.length; i++) {
        //         var oFile = aFiles[i];

        //         // Check for valid file type (jpg or jpeg)
        //         if (this._isValidFileType(oFile)) {
        //             // Check if the file is already in the list
        //             var bFileExists = aCurrentFiles.some(function (oCurrentFile) {
        //                 return oCurrentFile.fileName === oFile.name;
        //             });

        //             if (!bFileExists) {
        //                 aNewFiles.push({
        //                     fileName: oFile.name
        //                 });
        //             } else {
        //                 // Optional: Display a message if the file already exists
        //                 sap.m.MessageToast.show("File '" + oFile.name + "' is already added.");
        //             }
        //         } else {
        //             // Display a message if the file type is not valid
        //             sap.m.MessageToast.show("Only JPG/JPEG files are allowed.");
        //         }
        //     }

        //     // Concatenate the current files with the new files
        //     var aAllFiles = aCurrentFiles.concat(aNewFiles);

        //     // Update the model with the combined files list
        //     oModel.setProperty("/files", aAllFiles);

        //     // Clear the FileUploader field if needed (optional)
        //     var oFileUploader = this.byId("fileUploader");
        //     oFileUploader.clear();
        // },

        // _isValidFileType: function (oFile) {
        //     // Check if the file type is either jpeg or jpg
        //     var sFileType = oFile.type.toLowerCase();
        //     return sFileType === "image/jpeg" || sFileType === "image/jpg";
        // },
        onFileUploaderChange: function(oEvent) {
            // Get the files from the event
            var aFiles = oEvent.getParameter("files");
            var oModel = this.getView().getModel();
        
            // Get the current files list from the model
            var aCurrentFiles = oModel.getProperty("/files") || [];
        
            // Prepare new files array to append
            var aNewFiles = [];
            for (var i = 0; i < aFiles.length; i++) {
                var oFile = aFiles[i];
        
                // Check for valid file type (jpg or jpeg)
                if (this._isValidFileType(oFile)) {
                    // Check if the file size is within the allowed limit (8MB)
                    if (this._isFileSizeValid(oFile)) {
                        // Check if the file is already in the list
                        var bFileExists = aCurrentFiles.some(function (oCurrentFile) {
                            return oCurrentFile.fileName === oFile.name;
                        });
        
                        if (!bFileExists) {
                            // Generate preview URL for the image
                            var sPreviewUrl = URL.createObjectURL(oFile);
        
                            // Add file to the model
                            aNewFiles.push({
                                fileName: oFile.name,
                                previewUrl: sPreviewUrl,
                                file: oFile // Optionally store the entire file object
                            });
                        } else {
                            // Optional: Display a message if the file already exists
                            sap.m.MessageToast.show("File '" + oFile.name + "' is already added.");
                        }
                    } else {
                        // Display a message if the file size exceeds the limit
                        sap.m.MessageToast.show("File '" + oFile.name + "' exceeds the 8MB size limit.");
                    }
                } else {
                    // Display a message if the file type is not valid
                    sap.m.MessageToast.show("Only JPG/JPEG files are allowed.");
                }
            }
        
            // Concatenate the current files with the new files
            var aAllFiles = aCurrentFiles.concat(aNewFiles);
        
            // Update the model with the combined files list
            oModel.setProperty("/files", aAllFiles);
        
            // Clear the FileUploader field if needed (optional)
            var oFileUploader = this.byId("fileUploader");
            oFileUploader.clear();
        },

       
        
        
        _isValidFileType: function (oFile) {
            // Check if the file type is either jpeg or jpg
            var sFileType = oFile.type.toLowerCase();
            return sFileType === "image/jpeg" || sFileType === "image/jpg";
        },
        
        _isFileSizeValid: function (oFile) {
            // Check if the file size is less than or equal to 8MB (8 * 1024 * 1024 bytes)
            return oFile.size <= 8 * 1024 * 1024;
        },
        

        onDeleteItem: function (oEvent) {
            // Get the list item context and model
            var oButton = oEvent.getSource();
            var oItem = oButton.getParent().getParent();
            var oContext = oItem.getBindingContext();
            var oModel = this.getView().getModel();

            // Get the path of the selected item
            var sPath = oContext.getPath();
            var iIndex = parseInt(sPath.substring(sPath.lastIndexOf('/') + 1));

            // Get the files array from the model
            var aFiles = oModel.getProperty("/files");

            // Remove the selected file from the array
            if (iIndex > -1) {
                aFiles.splice(iIndex, 1);
            }

            // Update the model with the updated files array
            oModel.setProperty("/files", aFiles);
        },


        onUpload: function() {
            var oModel = this.getView().getModel();
            var aFiles = oModel.getProperty("/files");
        
            if (aFiles.length === 0) {
                sap.m.MessageToast.show("No files selected for upload.");
                return;
            }
        
            // Simulate file upload and update the list
            aFiles.forEach(function(fileData) {
                // Simulate upload process (replace with real upload logic)
                console.log("Uploading file:", fileData.fileName);
            });
        
            sap.m.MessageToast.show("Files uploaded successfully.");
        },
        
        onActivate: function () {
            var oModel = this.getView().getModel();
            oModel.setProperty("/files", []); // Initialize or clear files array
        },

        complianceFormatter: function (selectedSecurity, selectedEnvironment, selectedHealthy, selectedMarine) {
            var compliance = [];
            if (selectedSecurity) {
                compliance.push("Security");
            }
            if (selectedEnvironment) {
                compliance.push("Environment");
            }
            if (selectedHealthy) {
                compliance.push("Healthy & Safety");
            }
            if (selectedMarine) {
                compliance.push("Marine");
            }
            return compliance.join(", ");
        },
        // onSubmit: function () {
 
        //     var sPayload =
        //         '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        //         '<soap:Header/>' +
        //         '<soap:Body>' +
        //         '<ZCTCFM_INC_CREATE xmlns="urn:sap-com:document:sap:rfc:functions" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
        //         '<IV_CMP_FUNC_SE xmlns="">X</IV_CMP_FUNC_SE>' +
        //         '<IV_DESCRIPTION xmlns="">Test 4 CR ITSD-64709</IV_DESCRIPTION>' +
        //         '<IV_IMA_DESC_TEXT xmlns="">Test 4 CR ITSD-64709</IV_IMA_DESC_TEXT>' +
        //         '<IV_INC_START_DATE xmlns="">20240613 110000</IV_INC_START_DATE>' +
        //         '<IV_INC_TYPE xmlns="">I</IV_INC_TYPE>' +
        //         '<IV_LATITUDE xmlns="">51.5653</IV_LATITUDE>' +
        //         '<IV_LOC_DESC_TEXT xmlns="">Test 4 CR ITSD-64709</IV_LOC_DESC_TEXT>' +
        //         '<IV_LONGITUDE xmlns="">-2.9847</IV_LONGITUDE>' +
        //         '<IV_OBS_GROUP xmlns=""/>' +
        //         '<IV_PLANT xmlns="">Newport</IV_PLANT>' +
        //         '<IV_SUB_EMAIL xmlns="">nirali.patel@abports.co.uk</IV_SUB_EMAIL>' +
        //         '<IV_SUB_NAME xmlns="">Nirali Patel</IV_SUB_NAME>' +
        //         '<IV_SUB_TEL xmlns=""/>' +
        //         '<IV_TITLE xmlns="">Test 4 CR ITSD-64709</IV_TITLE>' +
        //         '</ZCTCFM_INC_CREATE>' +
        //         '</soap:Body>' +
        //         '</soap:Envelope>'


        //         var that = this;
        //         $.ajax({
        //             url: this.getBaseURL() + "/cxf/INC_CREATE1",
        //             method: "POST",
        //             data: sPayload,
        //             Accept: "*/*",
        //             contentType: "text/xml",
        //             success: function (data) {
        //                 debugger;
        //                 console.log(data); // Log the raw response to see its structure
                
        //                 // Convert the string response to an XML document
        //                 var xmlDoc = $.parseXML(data);
                
        //                 // Convert XML document to a jQuery object for easier manipulation
        //                 var $xml = $(xmlDoc);
                
        //                 // Log the entire parsed XML for debugging
        //                 console.log($xml);
                
        //                 // Attempt to find and extract the EV_INCIDENT_NUMBER element's text content
        //                 var incidentNumber = $xml.find("EV_INCIDENT_NUMBER").text();
                
        //                 // Log the extracted incident number
        //                 console.log("Extracted Incident Number:", incidentNumber);
                
        //                 // Check if incident number was found and show appropriate message box
        //                 if (incidentNumber) {
        //                     MessageBox.success("Incident Number: " + incidentNumber);
        //                 } else {
        //                     MessageBox.error("Incident number not found in the response.");
        //                 }
        //             }.bind(this),
        //             error: function (oError) {
        //                 debugger;
        //                 MessageBox.error("Error in the request.");
        //             },
        //         });
                
        // },
       
        onSubmit: function () {
            var oModel = this.getView().getModel();
            
            // Collect form data
            var incidentType = oModel.getProperty("/incidentType") || ""; // Ensure it's not null or empty
            var classification = oModel.getProperty("/classification") || "";
            var compliance = this.complianceFormatter(
                oModel.getProperty("/selectedSecurity"),
                oModel.getProperty("/selectedEnvironment"),
                oModel.getProperty("/selectedHealthy"),
                oModel.getProperty("/selectedMarine")
            );
            var port = oModel.getProperty("/port") || "";
            var location = oModel.getProperty("/location") || "";
            var title = oModel.getProperty("/title") || "";
            var dateTime = oModel.getProperty("/dateTime") || "";
            var description = oModel.getProperty("/description") || "";
            var decimalLat = oModel.getProperty("/decimalLat") || "";
            var decimalLong = oModel.getProperty("/decimalLong") || "";
            var action = oModel.getProperty("/action") || "";
            var name = oModel.getProperty("/name") || "";
            var telephone = oModel.getProperty("/telephone") || "";
            var email = oModel.getProperty("/email") || "";
        
            // Validate that incidentType is not empty
            if (!incidentType) {
                MessageBox.error("Incident Type is required.");
                return;
            }
        
            // Convert dateTime to required format: YYYYMMDD HHMMSS
            function formatDateTime(dateTime) {
                var date = new Date(dateTime);
                var year = date.getFullYear();
                var month = String(date.getMonth() + 1).padStart(2, '0');
                var day = String(date.getDate()).padStart(2, '0');
                var hours = String(date.getHours()).padStart(2, '0');
                var minutes = String(date.getMinutes()).padStart(2, '0');
                var seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}${month}${day} ${hours}${minutes}${seconds}`;
            }
        
            var formattedDateTime = formatDateTime(dateTime);
        
            // Construct the XML payload
            var sPayload =
               '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                   '<soap:Header/>' +
                    '<soap:Body>' +
                    '<ZCTCFM_INC_CREATE xmlns="urn:sap-com:document:sap:rfc:functions" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
                            `<IV_CMP_FUNC_SE xmlns="">X</IV_CMP_FUNC_SE>` +
                            `<IV_DESCRIPTION xmlns="">${description}</IV_DESCRIPTION>` +
                            `<IV_IMA_DESC_TEXT xmlns="">${action}</IV_IMA_DESC_TEXT>` +
                            `<IV_INC_START_DATE xmlns="">${formattedDateTime}</IV_INC_START_DATE>` +
                            `<IV_INC_TYPE xmlns="">I</IV_INC_TYPE>` +
                            `<IV_LATITUDE xmlns="">${decimalLat}</IV_LATITUDE>` +
                            `<IV_LOC_DESC_TEXT xmlns="">${location}</IV_LOC_DESC_TEXT>` +
                            `<IV_LONGITUDE xmlns="">${decimalLong}</IV_LONGITUDE>` +
                            `<IV_OBS_GROUP xmlns=""></IV_OBS_GROUP>` +
                            `<IV_PLANT xmlns="">${port}</IV_PLANT>` +  
                            `<IV_SUB_EMAIL xmlns="">${email}</IV_SUB_EMAIL>` +
                            `<IV_SUB_NAME xmlns="">${name}</IV_SUB_NAME>` +
                            `<IV_SUB_TEL xmlns="">${telephone}</IV_SUB_TEL>` +
                            `<IV_TITLE xmlns="">Test 4 CR ITSD-64709</IV_TITLE>` +
                        '</ZCTCFM_INC_CREATE>' +
                    '</soap:Body>' +
                '</soap:Envelope>'
        
            // Send the AJAX request
            $.ajax({
                url: this.getBaseURL() + "/cxf/INC_CREATE1",
                method: "POST",
                data: sPayload,
                contentType: "text/xml",
                success: function (data) {
                    console.log("SOAP Response:", data); // Log the entire SOAP response
            
                    try {
                        // Convert response to XML document
                        // var xmlDoc = $.parseXML(data);
                        // var $xml = $(xmlDoc);
            
                        // // Extract incident number using namespace-aware find
                        // var incidentNumber = $xml.find("EV_INCIDENT_NUMBER").text().trim();
                        // console.log("Extracted Incident Number:", incidentNumber);
            
                        var incidentNumber = data.all[3].children[1].innerHTML
                        if (incidentNumber) {
                            MessageBox.success("Incident Number: " + incidentNumber);
                        } else {
                            MessageBox.error("Incident number not found in the response.");
                        }
                    } catch (error) {
                        MessageBox.error("Error parsing XML or extracting data: " + error.message);
                    }
                }.bind(this),
                error: function (oError) {
                    // Extract error details if available
                    var errorText = oError.responseText || "Unknown error occurred.";
                    MessageBox.error("Error in the request: " + errorText);
                },
            });
            
            
            
        },
        getBaseURL: function () {
            return sap.ui.require.toUrl("com/abp/spotit");
        },

        
        
        
        


    });
});