# Overview

One of features Everlab doctors use in the backend is being able to automatically interpret pathology report data that arrives in the HL7/ORU format.

We are going to give you some database tables in CSV format as well as some sample ORU files and ask you to build a single page application that lets a doctor upload an ORU file and see high-risk results. This should be a full-stack web application using any technology of your choice. Things we care about are:

- Speed - how quickly can you build this?
- Accuracy - is the output correct?
- UX/Product - is this easy to use for a doctor?
- Quality - did you make good technical decisions?

We will leave what to display and how in the front-end up to you. Just keep in mind the user (and their goal) of easily interpreting someone’s report data.

# Context

There a 4 CSV files attached below. Each file represents a table as following

- diagnostic_metrics - specific metrics associated with a diagnostic, sometimes there are multiple metrics for one diagnostic.
    - Metrics also contain reference ranges of the form standard_lower → standard_higher and everlab_lower → everlab_higher. These indicate the “standard” and “everlab” acceptable values for results in these ranges.
    - Metrics are sometimes personalised based on min_age → max_age and gender. If values are given for a metric we should use the most specific age/gender based reference ranges.
    - oru_sonic_codes and oru_sonic_units fields are `;` delimited fields of possible ORU values that can match to the metric in the CSV file. We need to match on both code and units to get the right reference range

# Task

- You can start with this repo
- Please allow about 6 hours to complete the task
- Please use Typescript and React
- Please ensure your submission includes everything needed to run the code. (e.g if a Dockerfile or DB dump is required, please include it)
- Please host the final app somewhere so its easy to test and play with 

We recommend approaching this task by doing the following

- Take some time to understand how the HL7 file format works. Use a tool like https://www.hl7inspector.com/
- Understand which CSV files you need to use, and how. You can store them in a DB or parse the files directly to use them.
- Write an API to parse the ORU file into the individual test items and result values
- Write code to calculate the abnormal test values given our diagnostic_metrics table and the relevant conditions
    - If there is no relevant match then don’t return the result
- Write a front-end that lets a doctor upload an ORU file and see the relevant data.
