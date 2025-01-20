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
                // Hook setHTTPBody for modifying the request body
                Interceptor.attach(NSMutableURLRequest["- setHTTPBody:"].implementation, {
                    onEnter: function (args) {
                        const bodyData = new ObjC.Object(args[2]); // NSData
                        const bodyString = ObjC.classes.NSString.alloc().initWithData_encoding_(bodyData, 4).toString();

                        console.log(`[Captured Request Body Before Modification]: ${bodyString}`);

                        // Modify request body
                        if (bodyString.includes("specific_text"")) {
                            const modifiedBody = bodyString.replace(/specific_text"/g, "specific_text"");
                            console.log(`[Modified Request Body]: ${modifiedBody}`);

                            // Re-assign the modified body
                            const newBodyData = ObjC.classes.NSString.stringWithString_(modifiedBody).dataUsingEncoding_(4);
                            args[2] = newBodyData;
                        }
                    },
                });

             
            } else {
                console.log("[Hook Error]: NSMutableURLRequest not found.");
            }
        } catch (e) {
            console.log(`[Hook Error]: ${e}`);
        }
    }

    function interceptAndModifyRequestsAndResponses() {
        try {
            const func_urlSessionDidReceive = Module.getExportByName(
                null,
                '$s9Alamofire15SessionDelegateC03urlB0_8dataTask10didReceiveySo12NSURLSessionC_So0i4DataF0C10Foundation0J0VtF'
            );

            Interceptor.attach(func_urlSessionDidReceive, {
                onEnter(args) {
                    const dataTask = new ObjC.Object(args[1]); // NSURLSessionDataTask
                    const request = dataTask.currentRequest(); // NSURLRequest
                    const response = dataTask.response(); // NSURLResponse

                    const originalRequestUrl = request.URL().absoluteString();
                    const originalRequestHeaders = request.allHTTPHeaderFields();
                    const originalRequestBody = request.HTTPBody()
                        ? ObjC.classes.NSString.alloc().initWithData_encoding_(request.HTTPBody(), 4).toString()
                        : "";

                    console.log("[Original Request URL]:", originalRequestUrl);
                    console.log("[Original Request Headers]:", originalRequestHeaders);
                    console.log("[Original Request Body]:", originalRequestBody);

                    // Intercept and modify response
                    if (response) {
                        const originalResponseHeaders = response.allHeaderFields();
                        const originalResponseBody = response.HTTPBody()
                            ? ObjC.classes.NSString.alloc().initWithData_encoding_(response.HTTPBody(), 4).toString()
                            : "";

                        console.log("[Original Response Headers]:", originalResponseHeaders);
                        console.log("[Original Response Body]:", originalResponseBody);

                        let modifiedResponseBody = originalResponseBody;
                        if (originalResponseBody.includes("response_specific_text")) {
                            modifiedResponseBody = originalResponseBody.replace(/response_specific_text/g, "modified_response_text");
                            console.log("[Modified Response Body]:", modifiedResponseBody);
                        }
                    }
                },
            });
        } catch (e) {
            console.log(`[Hook Error]: ${e}`);
        }
    }

    function main() {
        disableSSLPinningGeneric();
        hookNSURLRequest();
        interceptAndModifyRequestsAndResponses();
    }

    main();
})();
