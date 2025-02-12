# BypassAlamofireSSL
This script is for bypassing SSL pinning (Alamofire) and capture network requests and responses on iOS applications.

## Features
- Bypasses SSL pinning.
- Hooks into `NSMutableURLRequest` to capture HTTP request bodies.
- Logs such as request URLs, headers, bodies, and response headers.
- Allows replacing text in HTTP request bodies dynamically (e.g., modify `ORIGINAL_TEXT` or other parameters).

## Usage
1. Load this script into a hooking framework like Frida.
2. Run the script on the target application.
```
frida-ps -Uai
```  
  
3. Monitor the console logs for captured network details.  

```
frida -U -l alamo-sslcap.js -f com.xxx.xxx
```

## Replace Text Feature
To modify request parameters, locate the section in the script where the request body is processed.  
Update the logic under the `// Modify request body` comment:

```
frida -U -l alamo-sslmod.js -f com.xxx.xxx
```

Change the `specific_text` to modify request parameters as needed
```javascript
if (bodyString.includes("specific_text"")) {
    const modifiedBody = bodyString.replace(/specific_text"/g, "specific_text"");
```

## Prerequisites
- Frida installed and set up on your system.
[Frida iOS Installation](https://frida.re/docs/ios/)

## Disclaimer
**This script is for educational purposes and authorized testing only.**

## License
[MIT License](LICENSE)
