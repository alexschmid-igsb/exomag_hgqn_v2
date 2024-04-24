const fs = require('fs')
const path = require('path')

const lodash = require('lodash')

const xlsx = require('xlsx')
xlsx.helper = require('../backend/util/xlsx-helper')

const database = require('../backend/database/connector').connector
const users = require('../backend/users/manager')

const Mailer = require('../backend/util/mail/SMTPMailer')

const IMAPClient = require('../backend/util/mail/IMAPClient')
const imapSession = IMAPClient.createSession()

const console = require('../backend/util/PrettyfiedConsole')

function randHex(len) {
    let maxlen = 8
    let min = Math.pow(16, Math.min(len, maxlen) - 1)
    let max = Math.pow(16, Math.min(len, maxlen)) - 1
    let n = Math.floor(Math.random() * (max - min + 1)) + min
    let r = n.toString(16).toUpperCase()
    while (r.length < len) {
        r = r + randHex(len - maxlen)
    }
    return r
}


let template = {

    subject: `Your "HGQN Datenbank" account has been created`,

    html: `
        <html lang="en">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            </head>
            <body style="background-color:rgba(0,0,0,0.03);font-family:HelveticaNeue,Helvetica,Arial,sans-serif">
                <table align="center" width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:37.5em;width:580px;margin:30px auto;box-shadow:rgba(0, 0, 0, 0.35) 0px 5px 15px;border-radius:3px">
                    <tbody>
                        <tr style="width:100%">
                            <td>
                                <table align="center" width="100%" style="border-radius:5px;text-align:center;display:flex;justify-content:center;aling-items:center;padding:20px;background-color:white;border:1px solid rgba(0,0,0,0.3);border-bottom:1px solid rgba(0,0,0,0.3);border-bottom-left-radius:0px;border-bottom-right-radius:0px" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <svg style="height:70px" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 81.15 27.82">
                                                    <g transform="translate(0,0)">
                                                        <rect rx="0.1" ry="0.1" style="fill:#88abca" y="0" height="3.65789474" x="8.05" width="8.05"></rect>
                                                        <rect rx="0.1" ry="0.1" style="fill:#88abca" y="3.65789474" height="1.82894737" x="0" width="8.05"></rect>
                                                        <rect rx="0.1" ry="0.1" style="fill:#19376b" y="6.584210532" height="1.097368422" x="8.05" width="8.05"></rect>
                                                        <rect rx="0.1" ry="0.1" style="fill:#88abca" y="7.681578954" height="1.82894737" x="0" width="8.05"></rect>
                                                        <rect rx="0.1" ry="0.1" style="fill:#88abca" y="10.242105272" height="1.82894737" x="8.05" width="8.05"></rect>
                                                        <rect rx="0.1" ry="0.1" style="fill:#cbdae8" y="12.80263159" height="2.560526318" x="0" width="8.05"></rect>
                                                        <rect rx="0.1" ry="0.1" style="fill:#467cac" y="15.363157908" height="1.82894737" x="8.05" width="8.05"></rect>
                                                        <rect rx="0.1" ry="0.1" style="fill:#467cac" y="17.192105278" height="2.194736844" x="0" width="8.05"></rect>
                                                        <rect rx="0.1" ry="0.1" style="fill:#88abca" y="19.386842122" height="3.65789474" x="8.05" width="8.05"></rect>
                                                        <rect rx="0.1" ry="0.1" style="fill:#19376b" y="24.142105284" height="1.82894737" x="0" width="8.05"></rect>
                                                        <rect rx="0.1" ry="0.1" style="fill:#19376b" y="25.971052654" height="1.82894737" x="8.05" width="8.05"></rect>
                                                        <g style="fill:#467cac" transform="translate(7.65,-53.5) scale(0.108)">
                                                            <path d="m 358.2936,669.5252 c -1.597,-1.613 -3.3246,-3.3182 -3.9696,-4.0412 -0.644,-0.722 -2.524,-2.5802 -4.489,-4.3802 -1.969,-1.801 -2.75599,-3.02539 -3.835,-4.4358 -1.33481,-1.4462 -3.07938,-3.7368 -4.78039,-4.67881 -2.99501,0.8826 -16.4342,4.13241 -22.5712,4.08941 -9.887,-0.067 -20.96841,-2.0626 -25.03141,-4.5786 -4.844,-3 -13.445,-11.602 -16.504,-16.508 -1.48,-2.379 -2.37271,-5.69042 -3.136,-10.324 -0.85794,-3.64782 -1.35429,-8.84116 -1.65147,-11.59197 -0.49106,-4.87581 1.81902,-15.73262 2.82284,-18.59073 0.394,-2.16534 1.93305,-6.15443 2.85163,-7.7313 0.88758,-1.58469 2.77,-4.145 6.16,-7.672 6.617,-6.894 15.555,-11.086 22.289,-13.07 2.098,-0.617 8.3923,-1.22165 10.3143,-1.29265 2.398,-0.086 12.61952,0.72111 18.70219,2.50304 2.97281,0.95111 7.66975,3.20776 9.20251,4.29361 2.35067,1.40621 11.13079,11.05998 12.23579,12.93098 0.566,0.965 2.89642,4.45743 3.65532,6.51193 1.0108,2.88601 3.69889,14.90409 3.67889,22.20909 -0.031,9.547 -4.6066,24.417 -8.7356,27.843 -3.23401,3.11582 -3.21461,2.99678 0.2476,6.887 2.824,2.7 4.191,4.075 7.562,7.622 1.754,1.843 4.422,4.531 5.938,5.972 4.919,5.72501 1.17953,11.34593 -4.176,11.176 -4.3157,-0.13694 -4.5924,-0.9238 -6.7804,-3.1428 z M 331.461,641.309 c 1.977,-0.84 3.781,-1.871 4.769,-2.641 0.422,-0.324 2.918,-2.066 5.305,-4.59 3.172,-3.359 4.621,-5.918 5.395,-9.519 1.925,-8.985 2.332,-15.621 1.254,-20.536 -0.586,-2.668 -1.1122,-5.69819 -2.0466,-8.5116 -1.85482,-4.44581 -8.98279,-11.91979 -10.42259,-13.21699 -0.777,-0.617 -3.57542,-2.03541 -5.19242,-2.63741 -1.895,-0.703 -2.94439,-1.563 -10.58839,-1.829 -8.77189,0.19676 -9.90889,0.15529 -15.649,2.473 -3.183,1.551 -6.09642,3.82418 -7.785,5.219 -1.102,1.32 -3.52058,3.72811 -4.94787,5.56052 -2.34553,3.08393 -4.98613,15.73148 -4.30613,21.15748 1.863,14.934 4.879,21.012 13.125,26.453 6.77,4.469 8.797,4.95 19.688,4.668 8.136,-0.211 8.586,-0.851 11.402,-2.05 z m -87.14258,1.44024 c 0.21474,-2.26492 0.22098,-1.114 0.16958,-3.85424 0.391,-2.051 0.692,-9.465 0.676,-16.477 -0.027,-11.441 0.16,-12.852 1.836,-13.75 2.629,-1.406 9.559,-1.242 10.746,0.25 2.672,3.367 1.82055,32.87909 1.30176,37.66427 -0.1716,2.42605 -0.51007,5.17968 -2.88245,6.82149 0,0 -5.39666,1.98405 -11.26731,2.25076 -5.0536,0.78447 -11.6628,0.45048 -13.898,0.43548 -2.0826,-0.015 -6.973,-0.199 -11.211,-0.992 -7.949,-1.489 -14.644,-4.434 -18.871,-8.309 -6.055,-5.543 -7.184,-6.984 -9.922,-12.621 -1.801,-3.707 -3.312,-8.996 -3.961,-13.852 -0.574,-4.316 -1.023,-7.597 -1.07,-8.796 -0.051,-1.368 0.101,-4.098 0.453,-7.176 0.379,-3.289 1.02,-6.051 1.582,-8.27 0.434,-1.722 1.164,-4.277 1.555,-5.453 0.406,-1.211 2.633,-4.367 3.652,-6.062 2.012,-3.332 7.863,-9.426 9.449,-10.547 1.856,-1.313 6.606,-4.657 8.606,-5.336 2.211,-0.754 5.758,-2.418 14.195,-3.524 6.414,-0.84 9.8542,-0.7838 12.703,-0.882 2.20721,0.144 7.74163,-0.017 11.91363,0.44799 4.6044,0.8212 4.92637,1.6366 5.84037,2.96821 1.2661,1.84457 1.90946,9.99124 1.13625,13.37944 -3.34423,1.39799 -10.12257,1.40006 -10.13828,-2.01379 0.0476,-1.66818 -4.27897,-1.38385 -13.19697,-1.38385 -10.387,0 -12.086,0.89194 -14.445,2 -1.93611,0.73571 -2.88013,1.31106 -4.293,2 -0.872,0.41 -2.79758,1.90965 -3.80276,2.86076 -1.355,0.734 -2.93277,2.77637 -4.54295,5.27242 -2.04842,3.17539 -2.78329,3.88682 -4.01429,12.08582 -0.777,5.172 -1.14118,9.17572 -0.972,12.343 0.72901,5.76309 2.535,14.965 6.183,18.766 2.02,2.106 5.695,5.219 8.172,6.918 3.906,2.688 5.574,3.152 12.691,3.547 4.504,0.25 9.743,0.16 11.641,-0.195 m -81.90858,-44.57903 c -0.0306,-2.43561 -0.0444,-0.29197 0.0176,-13.98397 0.067,-14.957 0.006,-16.03701 -0.11523,-18.94862 3.40961,-0.12517 10.74001,-0.28658 15.79864,-0.0192 0.0254,4.19102 -0.10841,10.91682 -0.0544,30.87382 0.149,53.348 0.3188,53.76979 0.28762,57.45741 -4.34981,-0.0726 -12.99364,0.13278 -16.27484,-0.0138 -0.005,-2.17861 -0.0828,-3.08761 -0.0828,-18.78661 0,-21.516 0.16218,-10.2453 0.0676,-21.18602 l -39.85881,0.3646 -0.2828,8.09042 c -0.266,20.317 0.44041,28.03738 0.14382,31.4536 -3.33081,0.0632 -12.32183,-0.0428 -15.40364,-0.11619 0.16482,-2.88082 0.12911,-48.60132 0.14111,-88.09732 3.71013,-0.28248 3.33705,-0.0973 7.11851,-0.2032 6.70906,-0.0289 5.12969,0.0956 7.88964,-0.0358 L 118,602.66799 h 18.309 c 13.945,0 19.48381,-0.2718 22.06222,-0.37919 M 383.31158,654.252 C 382.8352,651.06019 383,641.543 383,610.004 c 0,-40.762 -0.2472,-41.36139 0.78559,-43.97961 3.12381,-0.41019 11.8058,-0.76299 16.69942,0.35921 3.03481,3.54243 5.15808,7.71458 7.38008,11.92958 0.899,1.703 1.63015,2.64304 2.33389,3.78042 0.71272,1.53376 1.23668,2.26567 1.80102,3.3714 0.6052,1.27511 1.004,2.152 1.715,3.445 1.594,2.891 5.426,8.746 7.355,12.008 0.6846,1.1272 2.0614,3.1676 2.0614,3.1676 0.395,0.586 3.95199,5.752 10.8686,17.3754 0.824,1.488 1.949,3.34201 2.8654,3.63961 C 437.6068,624.3732 437.68,614.602 438,596.719 c 0.344,-19.309 0.0238,-28.4696 0.40719,-30.36681 1.9748,-0.19499 10.569,-0.75059 14.44202,0.15521 0.4618,2.90502 0.15079,7.2116 0.15079,43.5826 0,31.472 0.26921,40.86578 -0.26339,43.8488 -2.85544,0.77029 -13.7825,0.73807 -17.93343,0.1754 -1.7442,-2.47262 -2.34296,-4.58136 -3.99196,-7.55336 -0.722,-1.301 -3.39421,-6.19523 -3.94521,-7.08223 -0.551,-0.883 -2.23241,-3.54461 -3.28001,-5.22861 -0.859,-1.625 -2.5204,-4.17899 -4.26239,-7.05699 -1.743,-2.617 -2.37799,-3.46258 -2.8098,-4.31919 -0.511,-0.9256 -2.1036,-3.69921 -2.8496,-4.94521 -0.731,-1.215 -1.42,-2.7734 -2.82801,-4.96241 -1.4362,-2.18721 -2.99321,-4.0798 -4.30061,-6.14081 -2.71077,-4.16196 -5.6008,-8.72699 -6.3708,-9.92299 -1.148,-1.773 -3.00319,-3.71082 -3.00319,-3.71082 -0.54074,1.39363 -0.0904,4.20191 -0.01,6.48442 -0.043,1.84 0.871,12.683 0.676,27.519 0.26621,16.55514 0.16941,23.68699 -0.12878,27.15121 -4.87362,0.63379 -10.0724,0.77479 -14.38763,-0.0942 z"></path>
                                                        </g>
                                                        <g style="fill:#19376b" transform="scale(0.52) translate(-7.1,-31.2)">
                                                            <path d="m 47.631296,78.106255 -0.232833,-1.068917 h -3.439584 v -2.021417 h 2.57175 l -0.22225,-1.090083 h -2.3495 v -1.93675 h 3.14325 l -0.211666,-1.0795 h -4.296834 v 7.196667 z"></path>
                                                            <path d="m 49.811456,78.106255 v -5.132917 h -1.386417 v 5.132917 z m -0.6985,-5.852584 q 0.3175,0 0.53975,-0.22225 0.22225,-0.232833 0.22225,-0.560916 0,-0.328084 -0.232833,-0.550334 -0.22225,-0.22225 -0.53975,-0.22225 -0.3175,0 -0.53975,0.22225 -0.22225,0.22225 -0.22225,0.550334 0,0.328083 0.22225,0.560916 0.22225,0.22225 0.550333,0.22225 z"></path>
                                                            <path d="m 52.34087,78.106255 v -3.545417 q 0.179917,-0.127 0.391584,-0.275167 0.22225,-0.148166 0.47625,-0.243416 0.254,-0.09525 0.508,-0.09525 0.338666,0 0.53975,0.254 0.201083,0.254 0.201083,0.751416 v 3.153834 h 1.375833 v -3.217334 q 0,-0.592666 -0.15875,-1.058333 -0.148167,-0.47625 -0.529166,-0.751417 -0.370417,-0.275166 -1.068917,-0.275166 -0.275167,0 -0.613833,0.08467 -0.328084,0.07408 -0.687917,0.243417 -0.34925,0.15875 -0.677333,0.381 l -0.232834,-0.53975 h -0.899583 v 5.132917 z"></path>
                                                            <path d="m 61.569531,75.947255 v -0.423334 q 0,-0.73025 -0.254,-1.344083 -0.243417,-0.613833 -0.762,-0.973667 -0.518584,-0.370416 -1.322917,-0.370416 -0.79375,0 -1.375833,0.338666 -0.582084,0.328084 -0.899584,0.941917 -0.306916,0.60325 -0.306916,1.42875 0,0.814917 0.328083,1.42875 0.328083,0.60325 0.98425,0.931333 0.66675,0.328084 1.661583,0.328084 0.4445,0 0.783167,-0.08467 0.34925,-0.07408 0.624417,-0.211667 0.28575,-0.148166 0.518583,-0.338666 l -0.402167,-0.994834 q -0.338666,0.201084 -0.687916,0.328084 -0.34925,0.127 -0.804334,0.127 -0.508,0 -0.8255,-0.137584 -0.3175,-0.137583 -0.486833,-0.381 -0.169333,-0.254 -0.232833,-0.592666 z m -3.450167,-0.92075 q 0.0635,-0.338667 0.211667,-0.560917 0.148166,-0.22225 0.370416,-0.338667 0.22225,-0.116416 0.497417,-0.116416 0.275167,0 0.486833,0.116416 0.22225,0.105834 0.370417,0.328084 0.148167,0.22225 0.211667,0.5715 z"></path>
                                                            <path d="m 67.845425,78.106255 q 1.068916,-0.02117 1.799166,-0.455084 0.740834,-0.4445 1.121834,-1.248833 0.391583,-0.814917 0.391583,-1.93675 0,-1.037167 -0.370417,-1.830917 -0.359833,-0.804333 -1.090083,-1.259416 -0.73025,-0.465667 -1.852083,-0.465667 h -2.7305 v 7.196667 z m 0.05292,-6.0325 q 0.635,0 1.037167,0.28575 0.41275,0.28575 0.60325,0.8255 0.1905,0.529166 0.1905,1.280583 0,0.889 -0.232833,1.439333 -0.232834,0.550334 -0.66675,0.804334 -0.423334,0.243416 -1.016,0.243416 h -1.3335 v -4.878916 z"></path>
                                                            <path d="m 73.158257,76.571671 q 0,-0.275166 0.1905,-0.497416 0.1905,-0.22225 0.550333,-0.22225 h 1.037167 v 0.783166 q -0.264584,0.254 -0.560917,0.381 -0.28575,0.127 -0.5715,0.127 -0.1905,0 -0.338667,-0.07408 -0.137583,-0.08467 -0.22225,-0.211667 -0.08467,-0.137583 -0.08467,-0.28575 z m -0.550334,-2.12725 q 0.28575,-0.127 0.709084,-0.232833 0.423333,-0.105833 0.783166,-0.105833 0.381,0 0.592667,0.22225 0.22225,0.211666 0.232833,0.592666 v 0.01058 h -1.005416 q -0.867834,0.01058 -1.407584,0.433916 -0.53975,0.41275 -0.53975,1.2065 0,0.740834 0.455084,1.2065 0.455083,0.455084 1.397,0.455084 0.381,0 0.719666,-0.1905 0.34925,-0.1905 0.635,-0.486834 l 0.232834,0.550334 h 0.899583 v -3.376084 q 0,-0.550333 -0.306917,-0.973666 -0.296333,-0.433917 -0.804333,-0.677334 -0.508,-0.243416 -1.121833,-0.243416 -0.211667,0 -0.582084,0.0635 -0.359833,0.0635 -0.709083,0.169333 -0.34925,0.09525 -0.550333,0.232833 z"></path>
                                                            <path d="m 79.942155,72.994505 h -0.931333 v -1.471084 l -1.36525,0.243417 v 1.227667 h -0.687917 l -0.01058,1.037166 h 0.6985 v 2.434167 q 0,0.592667 0.254,1.005417 0.254,0.41275 0.6985,0.635 0.455083,0.211666 1.090083,0.211666 0.169333,0 0.370417,-0.05292 0.201083,-0.04233 0.381,-0.116417 0.179916,-0.0635 0.28575,-0.148167 l -0.402167,-0.994833 q -0.148167,0.0635 -0.28575,0.09525 -0.137583,0.03175 -0.275167,0.03175 -0.370416,0 -0.560916,-0.254 -0.1905,-0.254 -0.1905,-0.656167 v -2.19075 h 1.354666 z"></path>
                                                            <path d="m 86.069893,75.947255 v -0.423334 q 0,-0.73025 -0.254,-1.344083 -0.243417,-0.613833 -0.762,-0.973667 -0.518583,-0.370416 -1.322917,-0.370416 -0.793749,0 -1.375833,0.338666 -0.582083,0.328084 -0.899583,0.941917 -0.306917,0.60325 -0.306917,1.42875 0,0.814917 0.328084,1.42875 0.328083,0.60325 0.98425,0.931333 0.66675,0.328084 1.661583,0.328084 0.4445,0 0.783166,-0.08467 0.34925,-0.07408 0.624417,-0.211667 0.28575,-0.148166 0.518583,-0.338666 L 85.64656,76.603421 q -0.338667,0.201084 -0.687917,0.328084 -0.34925,0.127 -0.804333,0.127 -0.508,0 -0.8255,-0.137584 -0.3175,-0.137583 -0.486833,-0.381 -0.169334,-0.254 -0.232834,-0.592666 z m -3.450166,-0.92075 q 0.0635,-0.338667 0.211666,-0.560917 0.148167,-0.22225 0.370417,-0.338667 0.22225,-0.116416 0.497416,-0.116416 0.275167,0 0.486834,0.116416 0.22225,0.105834 0.370416,0.328084 0.148167,0.22225 0.211667,0.5715 z"></path>
                                                            <path d="m 88.292385,78.106255 v -3.545417 q 0.179917,-0.127 0.391584,-0.275167 0.22225,-0.148166 0.47625,-0.243416 0.254,-0.09525 0.508,-0.09525 0.338666,0 0.53975,0.254 0.201083,0.254 0.201083,0.751416 v 3.153834 h 1.375833 v -3.217334 q 0,-0.592666 -0.15875,-1.058333 -0.148166,-0.47625 -0.529166,-0.751417 -0.370417,-0.275166 -1.068917,-0.275166 -0.275167,0 -0.613833,0.08467 -0.328084,0.07408 -0.687917,0.243417 -0.34925,0.15875 -0.677333,0.381 l -0.232834,-0.53975 h -0.899583 v 5.132917 z"></path>
                                                            <path d="m 93.721629,78.106255 0.275167,-0.359834 q 0.296333,0.211667 0.635,0.34925 0.359833,0.137584 0.66675,0.137584 0.846667,0 1.42875,-0.338667 0.582083,-0.34925 0.889,-0.9525 0.3175,-0.613833 0.3175,-1.42875 0,-0.814917 -0.3175,-1.418167 -0.306917,-0.60325 -0.889,-0.931333 -0.5715,-0.328083 -1.375833,-0.328083 -0.359834,0 -0.687917,0.116416 -0.148167,0.05292 -0.275167,0.127 v -2.44475 l -1.36525,0.116417 v 7.355417 z m 0.66675,-3.788834 q 0.116417,-0.07408 0.22225,-0.137583 0.3175,-0.169333 0.687917,-0.169333 0.402167,0 0.66675,0.201083 0.264583,0.1905 0.402167,0.529167 0.137583,0.328083 0.137583,0.772583 0,0.433917 -0.137583,0.79375 -0.127,0.34925 -0.402167,0.550333 -0.275167,0.201084 -0.66675,0.201084 -0.359833,0 -0.687917,-0.15875 -0.105833,-0.05292 -0.22225,-0.137584 z"></path>
                                                            <path d="m 99.828201,76.571671 q 0,-0.275166 0.190499,-0.497416 0.1905,-0.22225 0.55033,-0.22225 h 1.03717 v 0.783166 q -0.26458,0.254 -0.56092,0.381 -0.28575,0.127 -0.5715,0.127 -0.1905,0 -0.33866,-0.07408 -0.137585,-0.08467 -0.222252,-0.211667 -0.08467,-0.137583 -0.08467,-0.28575 z m -0.550333,-2.12725 q 0.28575,-0.127 0.709083,-0.232833 0.423329,-0.105833 0.783169,-0.105833 0.381,0 0.59266,0.22225 0.22225,0.211666 0.23284,0.592666 v 0.01058 h -1.00542 q -0.867832,0.01058 -1.407582,0.433916 -0.53975,0.41275 -0.53975,1.2065 0,0.740834 0.455083,1.2065 0.455084,0.455084 1.396999,0.455084 0.381,0 0.71967,-0.1905 0.34925,-0.1905 0.635,-0.486834 l 0.23283,0.550334 h 0.89958 v -3.376084 q 0,-0.550333 -0.30691,-0.973666 -0.29634,-0.433917 -0.80434,-0.677334 -0.508,-0.243416 -1.12183,-0.243416 -0.21167,0 -0.58208,0.0635 -0.359835,0.0635 -0.709085,0.169333 -0.34925,0.09525 -0.550334,0.232833 z"></path>
                                                            <path d="m 105.47968,78.106255 v -3.545417 q 0.17992,-0.127 0.39159,-0.275167 0.22225,-0.148166 0.47625,-0.243416 0.254,-0.09525 0.508,-0.09525 0.33866,0 0.53975,0.254 0.20108,0.254 0.20108,0.751416 v 3.153834 h 1.37583 v -3.217334 q 0,-0.592666 -0.15875,-1.058333 -0.14816,-0.47625 -0.52916,-0.751417 -0.37042,-0.275166 -1.06892,-0.275166 -0.27517,0 -0.61383,0.08467 -0.32809,0.07408 -0.68792,0.243417 -0.34925,0.15875 -0.67733,0.381 l -0.23284,-0.53975 h -0.89958 v 5.132917 z"></path>
                                                            <path d="m 111.57567,78.106255 v -1.68275 l 0.56092,-0.47625 1.28058,2.159 h 1.57692 l -1.88383,-3.048 1.43933,-1.248834 -0.77258,-0.98425 -2.20134,2.021417 v -4.212167 l -1.36525,0.116417 v 7.355417 z"></path>
                                                            <path d="m 121.36523,73.174421 q -0.20108,-0.116416 -0.42333,-0.201083 -0.34925,-0.137583 -0.67734,-0.137583 -0.8255,0 -1.41816,0.34925 -0.58209,0.338666 -0.89959,0.9525 -0.30691,0.60325 -0.30691,1.418166 0,0.804334 0.30691,1.407584 0.3175,0.60325 0.89959,0.941916 0.58208,0.328084 1.37583,0.328084 0.37042,0 0.68792,-0.116417 0.32808,-0.116417 0.61383,-0.338667 0.0847,-0.0635 0.16933,-0.148166 l 0.32809,0.47625 h 0.71966 v -7.471834 l -1.37583,0.116417 z m 0,3.450167 q -0.21167,0.15875 -0.41275,0.264583 -0.3175,0.169334 -0.67733,0.169334 -0.37042,0 -0.65617,-0.1905 -0.27517,-0.201084 -0.42333,-0.53975 -0.13759,-0.338667 -0.13759,-0.772584 0,-0.455083 0.13759,-0.79375 0.14816,-0.34925 0.42333,-0.550333 0.27517,-0.201083 0.66675,-0.201083 0.34925,0 0.66675,0.15875 0.20108,0.08467 0.41275,0.275166 z"></path>
                                                            <path d="m 128.6148,75.947255 v -0.423334 q 0,-0.73025 -0.254,-1.344083 -0.24342,-0.613833 -0.762,-0.973667 -0.51859,-0.370416 -1.32292,-0.370416 -0.79375,0 -1.37583,0.338666 -0.58209,0.328084 -0.89959,0.941917 -0.30691,0.60325 -0.30691,1.42875 0,0.814917 0.32808,1.42875 0.32808,0.60325 0.98425,0.931333 0.66675,0.328084 1.66158,0.328084 0.4445,0 0.78317,-0.08467 0.34925,-0.07408 0.62442,-0.211667 0.28575,-0.148166 0.51858,-0.338666 l -0.40217,-0.994834 q -0.33866,0.201084 -0.68791,0.328084 -0.34925,0.127 -0.80434,0.127 -0.508,0 -0.8255,-0.137584 -0.3175,-0.137583 -0.48683,-0.381 -0.16933,-0.254 -0.23283,-0.592666 z m -3.45017,-0.92075 q 0.0635,-0.338667 0.21167,-0.560917 0.14816,-0.22225 0.37041,-0.338667 0.22225,-0.116416 0.49742,-0.116416 0.27517,0 0.48683,0.116416 0.22225,0.105834 0.37042,0.328084 0.14817,0.22225 0.21167,0.5715 z"></path>
                                                            <path d="m 129.16512,77.704088 q 0.24342,0.179917 0.5715,0.306917 0.33867,0.116416 0.66675,0.169333 0.32808,0.05292 0.53975,0.05292 1.04775,0 1.5875,-0.423334 0.55033,-0.423333 0.55033,-1.17475 0,-0.455083 -0.26458,-0.783166 -0.254,-0.338667 -0.65617,-0.582084 -0.39158,-0.243416 -0.8255,-0.381 -0.26458,-0.09525 -0.53975,-0.211666 -0.26458,-0.127 -0.254,-0.28575 0,-0.179917 0.16934,-0.306917 0.17991,-0.137583 0.4445,-0.137583 0.34925,0 0.66675,0.09525 0.3175,0.09525 0.68791,0.254 l 0.41275,-0.92075 q -0.254,-0.179917 -0.58208,-0.296334 -0.32808,-0.116416 -0.64558,-0.179916 -0.30692,-0.0635 -0.52917,-0.0635 -0.93133,0 -1.47108,0.423333 -0.52917,0.41275 -0.52917,1.143 0,0.423333 0.254,0.73025 0.26458,0.306917 0.65617,0.518583 0.40216,0.201084 0.79375,0.338667 0.29633,0.08467 0.48683,0.1905 0.20108,0.105833 0.30692,0.232833 0.10583,0.116417 0.10583,0.264584 0,0.148166 -0.14817,0.254 -0.13758,0.09525 -0.32808,0.148166 -0.1905,0.04233 -0.37042,0.04233 -0.1905,0 -0.41275,-0.04233 -0.21166,-0.04233 -0.4445,-0.116416 -0.23283,-0.08467 -0.48683,-0.179917 z"></path>
                                                            <path d="m 139.57909,78.106255 q 0.5715,0 1.03717,-0.137584 0.47625,-0.148166 0.81492,-0.423333 0.33866,-0.275167 0.508,-0.66675 0.17991,-0.391583 0.17991,-0.889 0,-0.66675 -0.3175,-1.100667 -0.30691,-0.433916 -0.79375,-0.687916 0.29634,-0.232834 0.53975,-0.550334 0.24342,-0.328083 0.24342,-0.73025 0,-0.73025 -0.30692,-1.164166 -0.29633,-0.4445 -0.83608,-0.645584 -0.52917,-0.201083 -1.22767,-0.201083 h -2.794 v 7.196667 z m -0.35983,-6.053667 q 0.34925,0 0.59267,0.08467 0.254,0.07408 0.381,0.275166 0.13758,0.1905 0.13758,0.529167 0,0.306917 -0.16933,0.508 -0.16934,0.201083 -0.47625,0.296333 -0.29634,0.09525 -0.67734,0.09525 h -1.016 v -1.788583 z m 0.34925,2.899833 q 0.508,0 0.81492,0.275167 0.30691,0.264583 0.30691,0.772583 0,0.306917 -0.15875,0.529167 -0.14816,0.211667 -0.42333,0.328083 -0.26458,0.116417 -0.635,0.116417 h -1.48167 v -2.021417 z"></path>
                                                            <path d="m 143.86534,70.803755 -1.37583,0.1905 2.794,7.122583 h 1.16416 l 2.80459,-7.196667 h -1.37584 l -1.97908,5.30225 z"></path>
                                                            <path d="m 152.98816,78.106255 q 1.06892,-0.02117 1.79917,-0.455084 0.74083,-0.4445 1.12183,-1.248833 0.39158,-0.814917 0.39158,-1.93675 0,-1.037167 -0.37041,-1.830917 -0.35984,-0.804333 -1.09009,-1.259416 -0.73025,-0.465667 -1.85208,-0.465667 h -2.7305 v 7.196667 z m 0.0529,-6.0325 q 0.635,0 1.03716,0.28575 0.41275,0.28575 0.60325,0.8255 0.1905,0.529166 0.1905,1.280583 0,0.889 -0.23283,1.439333 -0.23283,0.550334 -0.66675,0.804334 -0.42333,0.243416 -1.016,0.243416 h -1.3335 v -4.878916 z"></path>
                                                            <path d="m 163.13757,78.106255 v -7.196667 h -1.36525 v 3.048 h -2.83633 v -3.100917 l -1.36525,0.05292 v 7.196667 h 1.36525 v -3.048 h 2.83633 v 3.048 z"></path>
                                                        </g>
                                                    </g>
                                                </svg>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table align="center" width="100%" style="padding:5px 50px 10px 60px;background-color:rgba(170, 187, 204, 0.3);border:1px solid rgba(0,0,0,0.3);border-bottom:none;border-top:none" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tbody>
                                    <tr>
                                    <td>
                                        <br/>
                                        <p style="font-size:14px;line-height:1.5;margin:16px 0">Dear User,</p>
                                        <p style="font-size:14px;line-height:1.5;margin:16px 0">an HGQN Datenbank Account has been created for this email address.</p>
                                        <p style="font-size:14px;line-height:1.5;margin:16px 0">Please finish your registration to activate your account.</p>
                                    </td>
                                    </tr>
                                </tbody>
                                </table>
                                <table align="center" width="100%" style="text-align:center;padding:5px 50px 10px 60px;background-color:rgba(170, 187, 204, 0.3);border:1px solid rgba(0,0,0,0.3);border-bottom:none;border-top:none;display:flex;justify-content:center;aling-items:center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tbody>
                                    <tr>
                                    <td><a href="https://app.hgqn.de/activation/{{=token}}" target="_blank" style="border-radius:3px;background-color:#1976d2;font-weight:600;color:#fff;font-size:15px;text-decoration:none;line-height:100%;max-width:100%;padding:12px 20px;display:inline-block"><span><!--[if mso]><i style="letter-spacing: 20px;mso-font-width:-100%;mso-text-raise:18" hidden>&nbsp;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Activate Account</span><span><!--[if mso]><i style="letter-spacing: 20px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a></td>
                                    </tr>
                                </tbody>
                                </table>
                                <table align="center" width="100%" style="padding:5px 50px 10px 60px;background-color:rgba(170, 187, 204, 0.3);border:1px solid rgba(0,0,0,0.3);border-top:none;border-radius:5px;border-top-left-radius:0px;border-top-right-radius:0px" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tbody>
                                    <tr>
                                    <td>
                                        <p style="font-size:14px;line-height:1.5;margin:16px 0">Alternatively copy and paste the following URL into your browser:</p>
                                        <p style="font-size:14px;line-height:1.5;margin:16px 0;font-family:monospace;padding:4px 8px;border-radius:3px;background-color:#DDD;text-align:center">https://app.hgqn.de/activation/{{=token}}</p>
                                        <p style="font-size:14px;line-height:1.5;margin:16px 0">You will not be able to log into the "HGQN Datenbank" before you properly finish the activation of your account.</p>
                                    </td>
                                    </tr>
                                </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </body>
        </html>`,

    text: `
        Dear User,

        an "HGQN Datenbank" account has been created for this email address.
        
        To finish your registration, follow the activation link:

        https://app.hgqn.de/activation/{{=token}}

        You will not be able to log into HGQN Datenbank before you properly finish the
        activation of your account.`
}



async function loadData() {

    let data = {
        db: {},
        excel: {}
    }

    // labs aus datenbank
    {
        const res = await database.find('STATIC_labs')
        data.db.labs = {
            all: res.data,
            byId: new Map(),
            byShortName: new Map(),
            byName: new Map(),
            byWebsite: new Map(),
            byEmail: new Map(),
        }
        for(let lab of res.data) {
            data.db.labs.byId.set(lab._id,lab)
            data.db.labs.byShortName.set(lab.shortName,lab)
            data.db.labs.byName.set(lab.name,lab)
            data.db.labs.byWebsite.set(lab.website,lab)
            data.db.labs.byEmail.set(lab.email,lab)
        }
    }

    // user aus datenbank
    {
        const res = await database.find('CORE_users')
        data.db.users = {
            all: res.data,
            byId: new Map(),
            byEmail: new Map(),
            byUsername: new Map()
        }
        for(let user of res.data) {
            user.email = user.email.toLowerCase()
            data.db.users.byId.set(user._id,user)
            data.db.users.byEmail.set(user.email,user)
            data.db.users.byUsername.set(user.username,user)
        }
    }

    // hgqn labs aus dem zu importierenden excel file
    {
        let res = xlsx.helper.parseRowsFromFile(path.join(__dirname, '../config/hgqn/HGQN Labs_260324.xlsx'), 'Sheet1', 1)
        data.excel.labs = {
            all: res.rows,
            byId: new Map(),
            byShortName: new Map()
        }
        for(let row of res.rows) {
            for(let propertyName of Object.getOwnPropertyNames(row)) {
                row[propertyName] = lodash.isString(row[propertyName].value) ? row[propertyName].value.trim() : row[propertyName].value
            }
            if(row['ID'] != null) {
                data.excel.labs.byId.set(row['ID'].trim(),row)
            }
            data.excel.labs.byShortName.set(row['Anzeigename'].trim(),row)
        }
    }

    // hgqn user mit lab zuordnung
    {
        let res = xlsx.helper.parseRowsFromFile(path.join(__dirname, '../config/hgqn/HGQN Variantendatenbank_MG mit Zuordnung_gesamt.xlsx'), 'Tabelle1', 1)
        data.excel.usersMitLab = {
            all: res.rows,
            byEmail: new Map(),
        }
        for(let row of res.rows) {
            row['Email'].value = row['Email'].value.toLowerCase()
            for(let propertyName of Object.getOwnPropertyNames(row)) {
                row[propertyName] = lodash.isString(row[propertyName].value) ? row[propertyName].value.trim() : row[propertyName].value
            }
            data.excel.usersMitLab.byEmail.set(row['Email'].trim(),row)
        }
    }
    
    // hgqn user ohne lab zuordnung
    {
        let res = xlsx.helper.parseRowsFromFile(path.join(__dirname, '../config/hgqn/HGQN Variantendatenbank Verteiler_MG ohne Zuordnung.xlsx'), 'Tabelle2', 1)
        data.excel.usersOhneLab = {
            all: res.rows,
            byEmail: new Map(),
        }
        for(let row of res.rows) {
            row['Email'].value = row['Email'].value.toLowerCase()
            for(let propertyName of Object.getOwnPropertyNames(row)) {
                row[propertyName] = lodash.isString(row[propertyName].value) ? row[propertyName].value.trim() : row[propertyName].value
            }
            data.excel.usersOhneLab.byEmail.set(row['Email'].trim(),row)
        }
    }

    return data
}



async function importLabs(data) {

    let mappings = [
        { excel: 'Anzeigename', db: 'shortName' },
        { excel: 'Vollständiger Name', db: 'name' },
        { excel: 'Webseite', db: 'website' },
        { excel: 'Email', db: 'email' }
    ]

    const dbLabs = data.db.labs
    const importLabs = data.excel.labs

    let index = 0

    let countUpdated = 0
    let countUnchaged = 0
    let countAdded = 0

    for(let importLab of importLabs.all) {

        let id = importLab['ID']

        let dbLab = dbLabs.byId.get(id)
        if(dbLab != null) {

            // bereits in datenbank vorhanden
            let id = dbLab.id

            // checken ob lab in der datenbank geupdatet werden muss
            let needUpdate = false
            let update = {}

            for(let mapping of mappings) {
                let excelValue = importLab[mapping.excel] != null ? lodash.isString(importLab[mapping.excel]) ? importLab[mapping.excel].trim() : importLab[mapping.excel] : null
                let dbValue = dbLab[mapping.db] != null ? lodash.isString(dbLab[mapping.db]) ? dbLab[mapping.db].trim() : dbLab[mapping.db] : null
                if(excelValue !== dbValue) {
                    needUpdate = true
                    update[mapping.db] = excelValue
                }
            }

            if(needUpdate === true) {
                await database.findOneAndUpdate('STATIC_labs', { filter: { _id: dbLab._id} }, update)
                countUpdated++
            } else {
                countUnchaged++
            }

        } else {

            // nicht in der datenbank vorhanden

            let lab = {}
            for(let mapping of mappings) {
                let excelValue = importLab[mapping.excel] != null ? lodash.isString(importLab[mapping.excel]) ? importLab[mapping.excel].trim() : importLab[mapping.excel] : null
                lab[mapping.db] = excelValue
            }
            if(id != null) {
                lab._id = id
            }

            // nur einfügen, wenn der short name oder name noch nicht vorhanden sind
            if(data.db.labs.byShortName.get(lab.shortName) != null) {
                // let zeile = `   ZEILE ${index+2}: `
                // console.log(`${zeile}FEHLER BEIM HINZUFÜGEN VON NEUEM LAB`)
                // console.log(`${(new Array(zeile.length)).fill(' ').join('')}ES EXISTIERT BEREITS EIN LAB MIT ANZEIGENAME '${lab.shortName}'`)
                // console.log(`${(new Array(zeile.length)).fill(' ').join('')}DER IMPORT DIESES LABS WIRD ÜBERSPRUNGEN`)
                // console.log()
                continue
            } else {
                // console.log("shortName: " + lab.shortName + " OK")
            }

            if(data.db.labs.byName.get(lab.name) != null) {
                // let zeile = `   ZEILE ${index+2}: `
                // console.log(`${zeile}FEHLER BEIM HINZUFÜGEN VON NEUEM LAB`)
                // console.log(`${(new Array(zeile.length)).fill(' ').join('')}ES EXISTIERT BEREITS EIN LAB MIT NAME '${lab.name}'`)
                // console.log(`${(new Array(zeile.length)).fill(' ').join('')}DER IMPORT DIESES LABS WIRD ÜBERSPRUNGEN`)
                // console.log()
                continue
            } else {
                // console.log("name: " + lab.name + " OK")
            }
            
            // if(data.db.labs.byWebsite.get(lab.website) != null) {
            //     let zeile = `   ZEILE ${index+2}: `
            //     console.log(`${zeile}FEHLER BEIM HINZUFÜGEN VON NEUEM LAB`)
            //     console.log(`${(new Array(zeile.length)).fill(' ').join('')}ES EXISTIERT BEREITS EIN LAB MIT WEBSITE '${lab.website}'`)
            //     console.log(`${(new Array(zeile.length)).fill(' ').join('')}DER IMPORT DIESES LABS WIRD ÜBERSPRUNGEN`)
            //     console.log()
            //     continue
            // }
            // if(data.db.labs.byEmail.get(lab.email) != null) {
            //     let zeile = `   ZEILE ${index+2}: `
            //     console.log(`${zeile}FEHLER BEIM HINZUFÜGEN VON NEUEM LAB`)
            //     console.log(`${(new Array(zeile.length)).fill(' ').join('')}ES EXISTIERT BEREITS EIN LAB MIT EMAIL '${lab.email}'`)
            //     console.log(`${(new Array(zeile.length)).fill(' ').join('')}DER IMPORT DIESES LABS WIRD ÜBERSPRUNGEN`)
            //     console.log()
            //     continue
            // }

            // console.log("ADDE")
            // console.log(lab)

            dbLab = await database.insert('STATIC_labs', lab)

            data.db.labs.byId.set(dbLab._id,dbLab)
            data.db.labs.byShortName.set(dbLab.shortName,dbLab)
            data.db.labs.byName.set(dbLab.name,dbLab),
            data.db.labs.byWebsite.set(dbLab.website,dbLab),
            data.db.labs.byEmail.set(dbLab.email,dbLab)

            countAdded++
        }
        index++
    }

    console.log(`     updated: ${countUpdated}`)
    console.log(`     added: ${countAdded}`)
    console.log(`     unchanged: ${countUnchaged}`)
    console.log(`     total: ${index}`)

    // reload added or updated labs from database
    {
        const res = await database.find('STATIC_labs')
        data.db.labs = {
            all: res.data,
            byId: new Map(),
            byName: new Map(),
            byShortName: new Map(),
            byWebsite: new Map(),
            byEmail: new Map()
        }
        for(let lab of res.data) {
            data.db.labs.byId.set(lab._id,lab)
            data.db.labs.byShortName.set(lab.shortName,lab)
            data.db.labs.byName.set(lab.name,lab),
            data.db.labs.byWebsite.set(lab.website,lab),
            data.db.labs.byEmail.set(lab.email,lab)
        }
    }

}



async function importUsersMitZuordnung(data) {

    let index = 0
    let firstError = true

    let countErrors = 0
    let countUsersExisting = 0
    let countUsersAdded = 0
    let countActivationSent = 0

    for(let excelUser of data.excel.usersMitLab.all) {

        let excelLabShortName = excelUser['Anzeigename'] != null ? lodash.isString(excelUser['Anzeigename']) ? excelUser['Anzeigename'].trim() : excelUser['Anzeigename'] : null
        let excelLabName = excelUser['Vollständiger Name'] != null ? lodash.isString(excelUser['Vollständiger Name']) ? excelUser['Vollständiger Name'].trim() : excelUser['Vollständiger Name'] : null

        let excelEmail = excelUser['Email'] != null ? lodash.isString(excelUser['Email']) ? excelUser['Email'].trim() : excelUser['Email'] : null

        let excelName = excelUser['Name'] != null ? lodash.isString(excelUser['Name']) ? excelUser['Name'].trim() : excelUser['Name'] : null
        let username = excelName.toLowerCase().replaceAll(' ', '.')

        // identify the lab
        let dbLab = data.db.labs.byShortName.get(excelLabShortName)
        let dbLab2 = data.db.labs.byName.get(excelLabName)
        if(dbLab == null || dbLab2 == null || dbLab != dbLab2) {
            if(firstError) {
                firstError = false
                console.log()
            }

            let zeile = `   ZEILE ${index+2}: `
            console.log(`${zeile}FEHLER BEI USER MIT EMAIL '${excelEmail}'`)
            console.log(`${(new Array(zeile.length)).fill(' ').join('')}DAS ZUGEORDNETE LAB KONNTE NICHT GEFUNDEN WERDEN`)
            console.log(`${(new Array(zeile.length)).fill(' ').join('')}    Anzeigename: '${excelLabShortName}'`)
            console.log(`${(new Array(zeile.length)).fill(' ').join('')}    Vollständiger Name: '${excelLabName}'`)
            console.log(`${(new Array(zeile.length)).fill(' ').join('')}DER USER WIRD BEIM IMPORT ÜBERSPRUNGEN`)
            console.log()

            countErrors++
            index++
            continue
        }


        // checken ob es schon einen user mit dieser email gibt
        let dbUser = data.db.users.byEmail.get(excelEmail)
        if(dbUser == null) {

            // es gibt noch keinen user mit der emailadresse
            // jetzt checken ob der username schon existiert
            let check = data.db.users.byUsername.get(username)
            if(check != null) {
                // es gibt den username bereits. das kann passieren, wenn zwei verschiedene user den gleichen namen haben und deswegen den
                // gleichen username generiert bekommen haben. Oder aber weil der bereits in der datenbank existierende user eine falsche
                // email eingetragen hatte (im fall der HGQN Daten sind das emails mit umlauten oder 'ß')
                let emailKorrigiert = check.email.replaceAll('ö','oe').replaceAll('ö','ae').replaceAll('ü','ue').replaceAll('ß','ss')
                if(emailKorrigiert === excelEmail) {
                    // In diesem fall war der user bereits mit einer "falschen" emailadresse vorhanden.
                    // der alte user wird entfernt damit der neue hinzugefügt werden kann
                    await database.deleteOne('CORE_users', {_id: check._id, username: check.username, email: check.email})
                } else {
                    // In diesem fall ist unklar, warum es eine kollision der usernames gibt (eventuell ein user mit dem gleichen Namen).
                    // die einfachste lösung ist, einfach auf einen alternativen username auszuweichen (z.b. einfach die email)
                    username = excelEmail
                    // console.log("username change")
                }
            }

            // user einfügen
            dbUser = await database.insert('CORE_users', {
                username: username,
                email: excelEmail,
                isSuperuser: false,
                lab: dbLab._id,
                state: { id: 'IMPORTED' }
            })

            // add user to user maps
            data.db.users.byId.set(dbUser._id, dbUser)
            data.db.users.byEmail.set(dbUser.email, dbUser)
            data.db.users.byUsername.set(dbUser.username, dbUser)

            countUsersAdded++

            console.log()

        } else {

            countUsersExisting++

        }

        // user activation
        // unabhängig davon ob der user bereits in der datenbank war oder gerade eben erst neu hinzugefügt wurde,
        // muss der user einen registry link geschickt bekommen (vorrausgesetzt das ist noch nicht passiert).
        
        if(dbUser.state.id !== 'ACTIVE' && dbUser.state.id !== 'ACTIVATION_PENDING') {
        
            console.log("aktivierung " + dbUser.email)

            // token generieren
            let token = randHex(32)

            // state anpassen, activation token generieren
            let update = {
                state: {
                    id: 'ACTIVATION_PENDING',
                    token: token,
                    when: new Date(Date.now()).toISOString()
                }
            }

            // update user in datenbank
            await database.findByIdAndUpdate('CORE_users', dbUser._id, update)

            // activation mail senden
            await Mailer.sendTransactionMail({
                to: {
                    name: dbUser.username,
                    email: dbUser.email
                    // email: 'schmida@uni-bonn.de'     // zum testen des massenversands
                },
                template: template,
                params: { token: token },
                imapSession
            })

            countActivationSent++
        }

        index++
    }

    console.log(`   existing: ${countUsersExisting}`)
    console.log(`   added: ${countUsersAdded}`)
    console.log(`   errors: ${countErrors}`)
    console.log(`   total: ${index}`)
    console.log()
    console.log(`   new activations sent: ${countActivationSent}`)

}


async function importUsersOhneZuordnung(data) {

    let index = 0
    let firstError = true

    let countErrors = 0
    let countUsersExisting = 0
    let countUsersAdded = 0
    let countActivationSent = 0

    for(let excelUser of data.excel.usersOhneLab.all) {

        let excelLabShortName = excelUser['Anzeigename'] != null ? lodash.isString(excelUser['Anzeigename']) ? excelUser['Anzeigename'].trim() : excelUser['Anzeigename'] : null
        let excelLabName = excelUser['Vollständiger Name'] != null ? lodash.isString(excelUser['Vollständiger Name']) ? excelUser['Vollständiger Name'].trim() : excelUser['Vollständiger Name'] : null

        let excelEmail = excelUser['Email'] != null ? lodash.isString(excelUser['Email']) ? excelUser['Email'].trim() : excelUser['Email'] : null

        let excelName = excelUser['Name'] != null ? lodash.isString(excelUser['Name']) ? excelUser['Name'].trim() : excelUser['Name'] : null
        let username = excelName.toLowerCase().replaceAll(' ', '.')

        // checken ob es schon einen user mit dieser email gibt
        let dbUser = data.db.users.byEmail.get(excelEmail)
        if(dbUser == null) {

            // es gibt noch keinen user mit der emailadresse
            // jetzt checken ob der username schon existiert
            let check = data.db.users.byUsername.get(username)
            if(check != null) {
                // es gibt den username bereits. das kann passieren, wenn zwei verschiedene user den gleichen namen haben und deswegen den
                // gleichen username generiert bekommen haben. Oder aber weil der bereits in der datenbank existierende user eine falsche
                // email eingetragen hatte (im fall der HGQN Daten sind das emails mit umlauten oder 'ß')
                let emailKorrigiert = check.email.replaceAll('ö','oe').replaceAll('ö','ae').replaceAll('ü','ue').replaceAll('ß','ss')
                if(emailKorrigiert === excelEmail) {
                    // In diesem fall war der user bereits mit einer "falschen" emailadresse vorhanden.
                    // der alte user wird entfernt damit der neue hinzugefügt werden kann
                    await database.deleteOne('CORE_users', {_id: check._id, username: check.username, email: check.email})
                } else {
                    // In diesem fall ist unklar, warum es eine kollision der usernames gibt (eventuell ein user mit dem gleichen Namen).
                    // die einfachste lösung ist, einfach auf einen alternativen username auszuweichen (z.b. einfach die email)
                    username = excelEmail
                    // console.log("username change")
                }
            }

            // user einfügen
            dbUser = await database.insert('CORE_users', {
                username: username,
                email: excelEmail,
                isSuperuser: false,
                state: { id: 'IMPORTED' }
            })

            // add user to user maps
            data.db.users.byId.set(dbUser._id, dbUser)
            data.db.users.byEmail.set(dbUser.email, dbUser)
            data.db.users.byUsername.set(dbUser.username, dbUser)

            countUsersAdded++

            console.log()

        } else {

            countUsersExisting++

        }

        // user activation
        // unabhängig davon ob der user bereits in der datenbank war oder gerade eben erst neu hinzugefügt wurde,
        // muss der user einen registry link geschickt bekommen (vorrausgesetzt das ist noch nicht passiert).
        
        if(dbUser.state.id !== 'ACTIVE' && dbUser.state.id !== 'ACTIVATION_PENDING') {
        
            console.log("aktivierung " + dbUser.email)

            // token generieren
            let token = randHex(32)

            // state anpassen, activation token generieren
            let update = {
                state: {
                    id: 'ACTIVATION_PENDING',
                    token: token,
                    when: new Date(Date.now()).toISOString()
                }
            }

            // update user in datenbank
            await database.findByIdAndUpdate('CORE_users', dbUser._id, update)

            // activation mail senden
            await Mailer.sendTransactionMail({
                to: {
                    name: dbUser.username,
                    email: dbUser.email
                    // email: 'schmida@uni-bonn.de'     // zum testen des massenversands
                },
                template: template,
                params: { token: token },
                imapSession
            })

            countActivationSent++
        }

        index++
    }

    console.log(`   existing: ${countUsersExisting}`)
    console.log(`   added: ${countUsersAdded}`)
    console.log(`   errors: ${countErrors}`)
    console.log(`   total: ${index}`)
    console.log()
    console.log(`   new activations sent: ${countActivationSent}`)
   
}


async function main() {


    // init
    console.log('\n0. INIT')
    await database.initPromise
    await users.initPromise
    await imapSession.connect()
    console.log()

    // load data
    console.log('\n1. LOAD DATA')
    let data = await loadData()
    console.log()

    // synchronize labs between excel import and database
    console.log('\n2. IMPORT LABS')
    await importLabs(data)
    console.log()

    // process users "mit zuordnung"
    // console.log('\n3. IMPORT USERS "mit Zuordnung"')
    // await importUsersMitZuordnung(data)
    // console.log()

    // process users "ohne zuordnung"
    console.log('\n4. IMPORT USERS "ohne Zuordnung"')
    await importUsersOhneZuordnung(data)
    console.log()

    await database.disconnect()
    await imapSession.disconnect()
}










(async function () {
    await main()
    process.exit(0)
})()
















