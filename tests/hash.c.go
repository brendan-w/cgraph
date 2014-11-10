[
    {
        "line": 20, 
        "name": "hash_func", 
        "calls": [], 
        "public": false
    }, 
    {
        "line": 28, 
        "name": "HashCreate", 
        "calls": [
            {
                "line": 36, 
                "name": "malloc"
            }, 
            {
                "line": 41, 
                "name": "malloc"
            }
        ], 
        "public": true
    }, 
    {
        "line": 53, 
        "name": "HashInsert", 
        "calls": [
            {
                "line": 55, 
                "name": "hash_func"
            }, 
            {
                "line": 57, 
                "name": "HashRemove"
            }, 
            {
                "line": 58, 
                "name": "malloc"
            }, 
            {
                "line": 60, 
                "name": "malloc"
            }, 
            {
                "line": 61, 
                "name": "malloc"
            }, 
            {
                "line": 61, 
                "name": "strlen"
            }, 
            {
                "line": 62, 
                "name": "malloc"
            }, 
            {
                "line": 62, 
                "name": "strlen"
            }, 
            {
                "line": 63, 
                "name": "strcpy"
            }, 
            {
                "line": 64, 
                "name": "strcpy"
            }
        ], 
        "public": true
    }, 
    {
        "line": 68, 
        "name": "HashFind", 
        "calls": [
            {
                "line": 70, 
                "name": "hash_func"
            }, 
            {
                "line": 74, 
                "name": "strcmp"
            }
        ], 
        "public": true
    }, 
    {
        "line": 80, 
        "name": "HashRemove", 
        "calls": [
            {
                "line": 82, 
                "name": "hash_func"
            }, 
            {
                "line": 87, 
                "name": "strcmp"
            }, 
            {
                "line": 93, 
                "name": "free"
            }, 
            {
                "line": 94, 
                "name": "free"
            }, 
            {
                "line": 95, 
                "name": "free"
            }, 
            {
                "line": 96, 
                "name": "free"
            }
        ], 
        "public": true
    }, 
    {
        "line": 105, 
        "name": "HashPrint", 
        "calls": [
            {
                "line": 115, 
                "name": "PrintFunc"
            }
        ], 
        "public": true
    }, 
    {
        "line": 120, 
        "name": "HashDestroy", 
        "calls": [
            {
                "line": 131, 
                "name": "free"
            }, 
            {
                "line": 132, 
                "name": "free"
            }, 
            {
                "line": 133, 
                "name": "free"
            }, 
            {
                "line": 135, 
                "name": "free"
            }, 
            {
                "line": 138, 
                "name": "free"
            }, 
            {
                "line": 140, 
                "name": "free"
            }
        ], 
        "public": true
    }
]