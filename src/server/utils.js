/* 
[{
    domain: ["ad.toutiao.com", "i.snssdk.com"],
    rule: [{
        path: "/static/(.*)",
        resource: "$1"
    },
    {
        path: "/ad/m/index/",
        resource: ""
    }]
},
]
*/
module.exports.matchRule = function (rules, domain, path) {
    let rule = null;
    for (let r of rules) {
        for (let d of r.domain) {
            if (RegExp(d).test(domain)) {
                rule = r.rule;
                break;
            }
        }
        if (rule !== null) {
            break;
        }
    }
    if (rule !== null) {
        for (let l of rule) {
            const pregex = RegExp(l.path);
            if (pregex.test(path)) {
                rule = {
                    path: pregex,
                    resource: l.resource
                };
                break;
            }
        }
    }
    return rule;
}
