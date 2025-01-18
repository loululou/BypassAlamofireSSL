# BypassAlamofireSSL
This script is for bypassing SSL pinning (Alamofire) and capture network requests and responses on iOS applications.

## Features
- Bypasses SSL pinning.
- Hooks into `NSMutableURLRequest` to capture HTTP request bodies.
- Logs such as request URLs, headers, bodies, and response headers.

## Usage
1. Load this script into a hooking framework like Frida.
2. Run the script on the target application.
```
frida-ps -Uai
```  
  
3. Monitor the console logs for captured network details.  

```
frida -U -l alamo-ssl.js -f com.xxx.xxx
```

## Prerequisites
- Frida installed and set up on your system.
[Frida iOS Installation](https://frida.re/docs/ios/)

## Disclaimer
**This script is for educational purposes and authorized testing only.**

## License
[MIT License](LICENSE)
