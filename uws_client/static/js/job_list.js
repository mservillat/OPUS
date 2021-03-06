/*!
 * Copyright (c) 2016 by Mathieu Servillat
 * Licensed under MIT (https://github.com/mservillat/uws-server/blob/master/LICENSE)
 */

(function($) {
    "use strict";

    var server_url;
    var server_endpoint;
    var client_endpoint;

    var job_list_columns = [
        //'jobName',  // job.jobName
        'jobId',  // job.jobId
        'runId',  // job.runId
        'creationTime',
        'phase',
        'edit',
        //'details',
        //'results',
        'control',
        //'delete',
        //'ownerId',
    ];

    var jobnames = [];

    function get_jobnames() {
        // Get jobnames from server
        $('#loading').show();
        $.ajax({
            url : server_url + '/jdl',
            cache : false,
            type : 'GET',
            dataType: "json",
            success : function(json) {
                $('#loading').hide();
                console.log(json['jobnames']);
                jobnames = json['jobnames'];
                // Fill select
                for (var jn in json['jobnames']) {
                    $('.selectpicker').append('<option>' + json['jobnames'][jn] + '</option>')
                };
                $('.selectpicker').append('<option disabled>─────</option>');
                $('.selectpicker').append('<option>all</option>');
                $('.selectpicker').selectpicker('refresh');
                // Check if jobname is set in DOM
                var jobname = $('#jobname').attr('value');
                if (jobname) {
                    $('select[name=jobname]').val(jobname);
                    $('.selectpicker').selectpicker('refresh');
                    load_job_list();
                };
            },
            error : function(xhr, status, exception) {
                $('#loading').hide();
                console.log(exception);
                var jobname = $('#jobname').attr('value');
                if (jobname) {
                    $('.selectpicker').append('<option>' + jobname + '</option>');
                    $('select[name=jobname]').val(jobname);
                    $('.selectpicker').selectpicker('refresh');
                    load_job_list();
                };
            }
        });
    };

    function load_job_list() {
        var jobname = $('select[name=jobname]').val();
        var col_sort = job_list_columns.indexOf('creationTime');
        $('button.actions').removeAttr('disabled');
        if (jobname == 'all') {
            $('#loading').hide();
            $('#create_new_job').attr("disabled", "disabled");
            var cols = Array.from(job_list_columns);
            if (cols.indexOf('jobName') == -1) {
                cols.splice(0, 0, "jobName");
            };
            if (jobnames.length > 0) {
                uws_client.initClient(server_url, server_endpoint, client_endpoint, jobnames, cols);
            };
        } else {
            uws_client.initClient(server_url, server_endpoint, client_endpoint, [jobname], job_list_columns);
        };
        // init UWS Client
        // write new url in browser bar
        history.pushState({ jobname: jobname }, '', client_endpoint + uws_client.client_endpoint_jobs + "/" + jobname);
        // Prepare job list
        uws_client.getJobList();
        //if ( $( "#job_id" ).length ) {
        //    uws_client.selectJob($( "#jobid" ).attr('value'));
        //}
    };

    // LOAD JOB LIST AT STARTUP
    $(document).ready( function() {

        server_url = $('#server_url').attr('value');
        server_endpoint = $('#server_endpoint').attr('value');
        client_endpoint = $('#client_endpoint').attr('value');
        get_jobnames();
        $('.selectpicker').selectpicker('deselectAll');
        $('button.actions').attr('disabled', 'disabled');
        // Add events
        $('.selectpicker').on('change', function(){
            load_job_list();
        });
        $('#refresh_list').click( function() {
            uws_client.getJobList();
        });
        $('#create_test_job').click( function() {
            var jobname = $('select[name=jobname]').val();
            var formData = new FormData();
            //formData.append('inobs', 'http://voplus.obspm.fr/cta/events.fits');
            //formData.append('PHASE', 'RUN');
            uws_client.createTestJob(jobname, formData);
        });
        $('#create_new_job').click( function() {
            var jobname = $('select[name=jobname]').val();
            if (jobname) {
                window.location.href =  client_endpoint + uws_client.client_endpoint_job_form + "/" + jobname;
            };
        });

    });
    
})(jQuery);
