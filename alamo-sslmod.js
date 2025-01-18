(function () {
    function disableSSLPinningGeneric() {
        try {
            const SSLTrustEvaluate = Module.findExportByName(null, "SecTrustEvaluate");
            if (SSLTrustEvaluate) {
                Interceptor.replace(SSLTrustEvaluate, new NativeCallback(() => {
                    console.log("[SSL Pinning] Bypassed SecTrustEvaluate");
                    return 0; // Always trust
                }, "int", ["pointer", "pointer"]));
            } else {
                console.log("[SSL Pinning] SecTrustEvaluate not found");
            }
        } catch (e) {
            console.log(`[SSL Pinning Error]: ${e}`);
        }
    }

    function hookNSURLRequest() {
        try {
            const NSMutableURLRequest = ObjC.classes.NSMutableURLRequest;

            if (NSMutableURLRequest) {
                Interceptor.attach(NSMutableURLRequest["- setHTTPBody:"].implementation, {
                    onEnter: function (args) {
                        try {
                            const bodyData = new ObjC.Object(args[2]); // NSData
                            const bodyString = ObjC.classes.NSString.alloc().initWithData_encoding_(bodyData, 4).toString();
                            console.log(`[Captured Request Body]: ${bodyString}`);

                            // Parse and modify the body
                            // Change the logic here to modify request parameters as needed
                            let modifiedBody = bodyString
                                .replace(/ORIGINAL_TEXT/, "MODIFY_TEXT");
                            console.log(`[Modified Request Body]: ${modifiedBody}`);

                            // Convert the modified body back to NSData
                            const newBodyData = ObjC.classes.NSString.stringWithString_(modifiedBody).dataUsingEncoding_(4);
                            args[2] = newBodyData;
                        } catch (e) {
                            console.log(`[Hook Error on Enter]: ${e}`);
                        }
                    },
                });

                Interceptor.attach(NSMutableURLRequest["- setHTTPBodyStream:"].implementation, {
                    onEnter: function (args) {
                        console.log("[Captured Request Body Stream]");
                    },
                });
            } else {
                console.log("[Hook Error]: NSMutableURLRequest not found.");
            }
        } catch (e) {
            console.log(`[Hook Error]: ${e}`);
        }
    }

    function main() {
        disableSSLPinningGeneric();
        hookNSURLRequest();
    }

    main();
})();
