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
                        const bodyData = new ObjC.Object(args[2]); // NSData
                        const bodyString = ObjC.classes.NSString.alloc().initWithData_encoding_(bodyData, 4).toString();
                        console.log(`[Captured Request Body]: ${bodyString}`);
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

    function hookRequestsAndResponses() {
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

                    console.log(`[Request URL]: ${request.URL().absoluteString()}`);
                    console.log(`[Request Headers]: ${request.allHTTPHeaderFields()}`);

                    if (response) {
                        console.log(`[Response Status]: ${response.statusCode()}`);
                        console.log(`[Response Headers]: ${response.allHeaderFields().toString()}`);
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
        hookRequestsAndResponses();
    }

    main();
})();
