[
    {
        "name": "hash_func",
        "line": 18,
        "public": false,
        "calls": []
    },
    {
        "name": "HashCreate",
        "line": 26,
        "public": true,
        "calls": [
            {
                "name": "malloc",
                "line": 33
            },
            {
                "name": "malloc",
                "line": 37
            }
        ]
    },
    {
        "name": "HashInsert",
        "line": 48,
        "public": true,
        "calls": [
            {
                "name": "hash_func",
                "line": 50
            },
            {
                "name": "HashRemove",
                "line": 52
            },
            {
                "name": "malloc",
                "line": 53
            },
            {
                "name": "malloc",
                "line": 55
            },
            {
                "name": "malloc",
                "line": 56
            },
            {
                "name": "strlen",
                "line": 56
            },
            {
                "name": "malloc",
                "line": 57
            },
            {
                "name": "strlen",
                "line": 57
            },
            {
                "name": "strcpy",
                "line": 58
            },
            {
                "name": "strcpy",
                "line": 59
            }
        ]
    },
    {
        "name": "HashFind",
        "line": 63,
        "public": true,
        "calls": [
            {
                "name": "hash_func",
                "line": 65
            },
            {
                "name": "strcmp",
                "line": 69
            }
        ]
    },
    {
        "name": "HashRemove",
        "line": 75,
        "public": true,
        "calls": [
            {
                "name": "hash_func",
                "line": 77
            },
            {
                "name": "strcmp",
                "line": 82
            },
            {
                "name": "free",
                "line": 88
            },
            {
                "name": "free",
                "line": 89
            },
            {
                "name": "free",
                "line": 90
            },
            {
                "name": "free",
                "line": 91
            }
        ]
    },
    {
        "name": "HashPrint",
        "line": 100,
        "public": true,
        "calls": [
            {
                "name": "PrintFunc",
                "line": 110
            }
        ]
    },
    {
        "name": "HashDestroy",
        "line": 115,
        "public": true,
        "calls": [
            {
                "name": "free",
                "line": 126
            },
            {
                "name": "free",
                "line": 127
            },
            {
                "name": "free",
                "line": 128
            },
            {
                "name": "free",
                "line": 130
            },
            {
                "name": "free",
                "line": 133
            },
            {
                "name": "free",
                "line": 135
            }
        ]
    }
]