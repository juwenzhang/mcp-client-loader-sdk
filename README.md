## MCP executor demo

* 核心分为了两种吧

    * streamable-http -- 网络调度 mcp 的形式，依赖于 node-fetch 库
    
    * stdio -- 子进程调度 mcp 的形式，依赖于 child_process 库