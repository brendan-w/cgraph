[
    {
        "name": "hash_func",
        "line": 20,
        "public": false,
        "calls": []
    },
    {
        "name": "HashCreate",
        "line": 28,
        "public": true,
        "calls": [
            {
                "name": "malloc",
                "line": 35
            },
            {
                "name": "malloc",
                "line": 39
            }
        ]
    },
    {
        "name": "HashInsert",
        "line": 50,
        "public": true,
        "calls": [
            {
                "name": "hash_func",
                "line": 52
            },
            {
                "name": "HashRemove",
                "line": 54
            },
            {
                "name": "malloc",
                "line": 55
            },
            {
                "name": "malloc",
                "line": 57
            },
            {
                "name": "malloc",
                "line": 58
            },
            {
                "name": "strlen",
                "line": 58
            },
            {
                "name": "malloc",
                "line": 59
            },
            {
                "name": "strlen",
                "line": 59
            },
            {
                "name": "strcpy",
                "line": 60
            },
            {
                "name": "strcpy",
                "line": 61
            }
        ]
    },
    {
        "name": "HashFind",
        "line": 65,
        "public": true,
        "calls": [
            {
                "name": "hash_func",
                "line": 67
            },
            {
                "name": "strcmp",
                "line": 71
            }
        ]
    },
    {
        "name": "HashRemove",
        "line": 77,
        "public": true,
        "calls": [
            {
                "name": "hash_func",
                "line": 79
            },
            {
                "name": "strcmp",
                "line": 84
            },
            {
                "name": "free",
                "line": 90
            },
            {
                "name": "free",
                "line": 91
            },
            {
                "name": "free",
                "line": 92
            },
            {
                "name": "free",
                "line": 93
            }
        ]
    },
    {
        "name": "HashPrint",
        "line": 102,
        "public": true,
        "calls": [
            {
                "name": "PrintFunc",
                "line": 112
            }
        ]
    },
    {
        "name": "HashDestroy",
        "line": 117,
        "public": true,
        "calls": [
            {
                "name": "free",
                "line": 128
            },
            {
                "name": "free",
                "line": 129
            },
            {
                "name": "free",
                "line": 130
            },
            {
                "name": "free",
                "line": 132
            },
            {
                "name": "free",
                "line": 135
            },
            {
                "name": "free",
                "line": 137
            }
        ]
    }
]