'use strict';

var rp = require('request-promise');

function PagerDuty(token) {

    this.getOnCalls = function () {

        var options = {
            url: 'https://api.pagerduty.com/oncalls',
            qs: {
                time_zone: 'UTC',
                earliest: true,
                sort_by: 'escalation_level:asc',
            },
            headers: {
                Authorization: `Token token=${token}`,
                Accept: 'application/vnd.pagerduty+json;version=2',
            },
            json: true,
        };

        var allResults = [];
        function handleResponse(json) {
            var pageResults = json.oncalls.map(oncall => {
                return {
                    end: oncall.end,
                    escalationLevel: oncall.escalation_level,
                    policyId: oncall.escalation_policy.id,
                    policyName: oncall.escalation_policy.summary,
                    policyUrl: oncall.escalation_policy.html_url,
                    scheduleName: !oncall.schedule ? undefined : oncall.schedule.summary,
                    scheduleUrl: !oncall.schedule ? undefined : oncall.schedule.html_url,
                    userName: oncall.user.summary,
                    userUrl: oncall.user.html_url,
                };
            });
            allResults = allResults.concat(pageResults);
            if (json.more) {
                options.qs.offset = json.offset + json.limit;
                return rp(options).then(handleResponse);
            }
            return allResults;
        }

        return rp(options).then(handleResponse);

    };

}

module.exports = PagerDuty;
