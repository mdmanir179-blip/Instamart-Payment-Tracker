import { InvoiceRecord, PaymentRecord } from '../types';
import { parseINR } from '../utils/currency';

export const RAW_SAMPLE_INVOICE_CSV = `Organization Name,Vendor Name,Vendor Code,GSTIN,PAN,Warehouse Name,City,State,Status of Invoice,PO No.,PO Date,PO Amount,GRN No.,GRN Date,Gross GRN Amount,Invoice Number,Invoice Accounting Date,Invoices recorded,TDS/TCS,Purchase Return Amount,Brand discount (Promo Claims),Other Debit Amount,Other adjustments *,Net Payable Amount,Other Adjustment Date,Invoice Status,Payment amount,Payment Reference No,Outstanding payment,Due Date,Credit Period,Overdue,Payment Status,Last Payment Date
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,Viz IM1,,,Posted,VIAPO74796,,,VIA000094455##10072026,10-07-2026,10166,TBC/26-27/831,11-07-2026,10166,0,0.00,0.00,0.00,0.0,"10,166.00",,Reconciled,0.00,,10166.00,09-08-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR Ecom2,,,Posted,MBLPO441800,,,MBL000538494##26092026,26-09-2026,6965,TBC/26-27/1090,27-09-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,26-10-2026,30,Not Due,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR Ecom2,,,Posted,MBLPO436000,,,MBL000528265##07092026,07-09-2026,10166,TBC/26-27/1016,08-09-2026,10166,0,0.00,0.00,0.00,0.0,"10,166.00",,Reconciled,0.00,,10166.00,07-10-2026,30,Not Due,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR Ecom2,,,Posted,MBLPO429934,,,MBL000520514##27082026,27-08-2026,79858,TBC/26-27/962,29-08-2026,79858,0,"15,715.00",0.00,0.00,0.0,"64,143.29",,Reconciled,0.00,,64143.29,26-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR Ecom2,,,Posted,MBLPO429352,,,MBL000519406##26082026,26-08-2026,13930,TBC/26-27/959,27-08-2026,13930,0,0.00,0.00,0.00,0.0,"13,930.00",,Reconciled,0.00,,13930.00,25-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR Ecom2,,,Posted,MBLPO426378,,,MBL000517365##22082026,22-08-2026,6965,TBC/26-27/936,23-08-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,21-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR Ecom2,,,Posted,MBLPO423618,,,MBL000507196##03082026,03-08-2026,6965,TBC/26- 27/895,05-08-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,02-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR Ecom2,,,Posted,MBLPO419163,,,MBL000503738##28072026,28-07-2026,10166,TBC/26-27/882,29-07-2026,10166,0,0.00,0.00,0.00,0.0,"10,166.00",,Reconciled,0.00,,10166.00,27-08-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR Ecom2,,,Posted,MBLPO413621,,,MBL000493938##10072026,10-07-2026,10166,TBC/26-27/833,11-07-2026,10166,0,0.00,0.00,0.00,0.0,"10,166.00",,Reconciled,0.00,,10166.00,09-08-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR DHL,,,Posted,MBJPO93095,,,MBJ000111851##03092026,03-09-2026,6965,TBC/26-27/1014,04-09-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,03-10-2026,30,Not Due,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR DHL,,,Posted,MBJPO89649,,,MBJ000108897##27082026,27-08-2026,45012,TBC/26-27/964,28-08-2026,45012,0,856.94,0.00,0.00,0.0,"44,155.06",,Reconciled,0.00,,44155.06,26-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR DHL,,,Posted,MBJPO85506,,,MBJ000102844##12082026,12-08-2026,6965,TBC/26-27/916,13-08-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,11-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR DHL,,,Posted,MBJPO77772,,,MBJ000090215##10072026,10-07-2026,10166,TBC/26-27/832,11-07-2026,10166,0,0.00,0.00,0.00,0.0,"10,166.00",,Reconciled,0.00,,10166.00,09-08-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO425857,,,MBI000424498##16092026,16-09-2026,6965,TBC/26-27/1052,17-09-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,16-10-2026,30,Not Due,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO425034,,,MBI000416957##03092026,03-09-2026,6965,TBC/26-27/1017,04-09-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,03-10-2026,30,Not Due,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO421123,,,MBI000416735##03092026,03-09-2026,121685,TBC/26-27/993,04-09-2026,121685,0,"19,595.29",0.00,0.00,0.0,"1,02,089.85",,Reconciled,0.00,,102089.85,03-10-2026,30,Not Due,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO413011,,,MBI000405844##12082026,12-08-2026,6965,TBC/26-27/917,13-08-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,11-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO412469,,,MBI000401119##02082026,02-08-2026,6965,tbc/26-27/896,03-08-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,01-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO407427,,,MBI000398517##28072026,28-07-2026,20531,TBC/26,29-07-2026,20531,0,0.00,0.00,0.00,0.0,"20,531.00",,Reconciled,"15,900.00",HSBCN52026082378911714,4631.00,27-08-2026,30,Overdue,Partially Paid,21-08-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO406456,,,MBI000398177##27072026,27-07-2026,10141,TBC/26-27/881,28-07-2026,10141,0,0.00,0.00,0.00,0.0,"10,140.50",,Reconciled,0.00,,10140.50,26-08-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO401287,,,MBI000390330##11072026,11-07-2026,40411,TBC/26-27/826,12-07-2026,40411,0,0.00,0.00,0.00,0.0,"40,411.00",,Reconciled,0.00,,40411.00,10-08-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO400100,,,MBI000391397##13072026,13-07-2026,19667,TBC/26-27/839,15-07-2026,19667,0,0.00,0.00,0.00,0.0,"19,667.00",,Reconciled,0.00,,19667.00,12-08-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO398145,,,MBI000391733##14072026,14-07-2026,5724,TBC/26-27/816,15-07-2026,5724,0,0.00,0.00,0.00,0.0,"5,724.00",,Reconciled,0.00,,5724.00,13-08-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO396965,,,MBI000380421##18062026,18-06-2026,20332,TBC/26-27/744,19-06-2026,20332,0,"1,626.61",0.00,0.00,0.0,"18,705.44",,Reconciled,"18,705.44",HSBCN52026082378911714,0.00,18-07-2026,30,No due,Paid,21-08-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO396177,,,MBI000381870##22062026,22-06-2026,6965,TBC/26-27/774,23-06-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,"6,965.00",HSBCN52026083181436218,0.00,22-07-2026,30,No due,Paid,28-08-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO387228,,,MBI000377852##12062026,12-06-2026,19667,TBC/26-27/729,14-06-2026,19667,0,0.00,0.00,0.00,0.0,"19,667.00",,Reconciled,"19,667.00","HSBCN52026071968027719, HSBCN52026082378911714",0.00,12-07-2026,30,No due,Paid,21-08-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO382594,,,MBI000367470##20052026,20-05-2026,69692,TBC/26-27/647,22-05-2026,69692,0,0.00,0.00,0.00,0.0,"69,692.00",,Reconciled,"52,685.56","HSBCN52026070463349389, HSBCN52026070865153388",17006.44,19-06-2026,30,Overdue,Partially Paid,07-07-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO382148,,,MBI000372754##30052026,30-05-2026,11448,TBC/26-27/683,31-05-2026,11448,0,0.00,0.00,0.00,0.0,"11,448.01",,Reconciled,"11,448.01",HSBCN52026082378911714,0.00,29-06-2026,30,No due,Paid,21-08-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO376118,,,MBI000367544##20052026,20-05-2026,3176,TBC/26-27/624,22-05-2026,3176,0,0.00,0.00,0.00,0.0,"3,175.50",,Reconciled,"3,175.50",HSBCN52026082378911714,0.00,19-06-2026,30,No due,Paid,21-08-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO372864,,,MBI000361631##08052026,08-05-2026,13316,TBC/26-27/598,10-05-2026,13316,0,0.00,0.00,0.00,0.0,"13,316.01",,Reconciled,"13,316.01",HSBCN52026083181436218,0.00,07-06-2026,30,No due,Paid,28-08-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO364223,,,MBI000349720##09042026,09-04-2026,20332,TBC/25-26/519,10-04-2026,20332,0,0.00,0.00,0.00,0.0,"20,332.00",,Reconciled,"20,332.00","HSBCN52026051447065538, HSBCN52026083181436218, HSBCN52026061657040046",0.00,09-05-2026,30,No due,Paid,28-08-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO358266,,,MBI000344790##27032026,27-03-2026,39948,TBC/25-26/487,28-03-2026,39948,0,0.00,0.00,0.00,0.0,"39,948.01",,Reconciled,"39,948.01","HSBCN52026052850698995, HSBCN52026050544331170, HSBCN52026083181436218, HSBCN52026042139381660",0.00,26-04-2026,30,No due,Paid,28-08-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM1,,,Posted,MBIPO349745,,,MBI000335257##06032026,06-03-2026,20332,TBC/25-26/437,07-03-2026,20332,0,0.00,0.00,0.00,0.0,"20,332.00",,Reconciled,"20,332.00","HSBCN52026041137129384, HSBCN52026042139381660",0.00,05-04-2026,30,No due,Paid,20-04-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM4,,,Posted,MBEPO49053,,,MBE000069726##08092026,08-09-2026,6965,TBC/26-27/1015,09-09-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,08-10-2026,30,Not Due,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM4,,,Posted,MBEPO47443,,,MBE000068978##06092026,06-09-2026,56573,TBC/26-27/1004,07-09-2026,56573,0,0.00,0.00,0.00,0.0,"56,572.51",,Reconciled,0.00,,56572.51,06-10-2026,30,Not Due,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM4,,,Posted,MBEPO46616,,,MBE000066424##01092026,01-09-2026,6965,TBC/26- 27/992,02-09-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,01-10-2026,30,Not Due,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM4,,,Posted,MBEPO46216,,,MBE000066541##01092026,01-09-2026,6965,TBC/26- 27/991,02-09-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,01-10-2026,30,Not Due,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM4,,,Posted,MBEPO45685,,,MBE000065523##29082026,29-08-2026,6965,TBC/26-27/974,30-08-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,28-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM4,,,Posted,MBEPO45526,,,MBE000063705##26082026,26-08-2026,36773,TBC/26-27/961,27-08-2026,36773,0,0.00,0.00,0.00,0.0,"36,772.50",,Reconciled,0.00,,36772.50,25-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM4,,,Posted,MBEPO45385,,,MBE000065526##29082026,29-08-2026,6965,TBC/26-27/973,30-08-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,28-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM4,,,Posted,MBEPO45053,,,MBE000065534##29082026,29-08-2026,6965,TBC/26-27/972,30-08-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,28-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM4,,,Posted,MBEPO44769,,,MBE000065456##29082026,29-08-2026,45012,TBC/26-27/963,30-08-2026,45012,0,"29,281.00",0.00,0.00,0.0,"15,731.11",,Reconciled,0.00,,15731.11,28-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM4,,,Posted,MBEPO44285,,,MBE000063740##26082026,26-08-2026,6965,TBC/26-27/960,27-08-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,25-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,BLR IM4,,,Posted,MBEPO38826,,,MBE000054692##02082026,02-08-2026,6965,TBC-26-27/897,03-08-2026,6965,0,0.00,0.00,0.00,0.0,"6,965.00",,Reconciled,0.00,,6965.00,01-09-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,KOL IM2,,,Posted,KWBPO97449,,,KWB000212657##11072026,11-07-2026,55178,TBC/26,12-07-2026,55178,0,222.60,0.00,0.00,0.0,"54,955.39",,Reconciled,0.00,HSBCN52026082378911714,54955.39,10-08-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,CHE AMB IM2,,,Posted,JN2PO101973,,,JN2000165523##11072026,11-07-2026,34846,TBC/26-27/827,12-07-2026,34846,0,0.00,0.00,0.00,0.0,"34,846.00",,Reconciled,0.00,,34846.00,10-08-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,DLHY GGNFC5,,,Posted,FC5PO410943,,,FC5000485706##10072026,10-07-2026,45012,TBC/26-27/809,11-07-2026,45012,0,0.00,0.00,0.00,0.0,"45,012.00",,Reconciled,"45,012.00",HSBCN52026081276406434,0.00,09-08-2026,30,No due,Paid,12-08-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,PUN Delhivery,,,Posted,CPDPO283838,,,CPD000305244##10072026,10-07-2026,10166,TBC/26-27/829,11-07-2026,10166,0,0.00,0.00,0.00,0.0,"10,166.00",,Reconciled,0.00,,10166.00,09-08-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,MUM FC22,,,Posted,CMFPO334187,,,CMF000413210##10072026,10-07-2026,45012,TBC/26-27/810,11-07-2026,45012,0,0.00,0.00,0.00,0.0,"45,012.00",,Reconciled,"40,460.16","HSBCN52026081276406434, HSBCN52026073071083545",4551.84,09-08-2026,30,Overdue,Partially Paid,12-08-2026
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,HYD IM2,,,Posted,CHCPO359714,,,CHC000414441##10072026,10-07-2026,34846,TBC/26-27/828,11-07-2026,34846,0,"1,257.20",0.00,0.00,0.0,"33,588.83",,Reconciled,0.00,,33588.83,09-08-2026,30,Overdue,Unpaid,
SCOOTSY LOGISTICS PRIVATE LIMITED,The Brothers and Co,1N96368405,19BRXPA0554J1ZF,BRXPA0554J,,,,Posted,,,,,,,MBL-DN809144_Reversed,31-08-2026,15715,0,0.00,0.00,0.00,0.0,"15,715.00",,Reconciled,0.00,,15715.00,,,Overdue,Unpaid,`;

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseRawInvoiceCsv(csvContent: string): InvoiceRecord[] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Skip header line
  const records: InvoiceRecord[] = [];

  for (let idx = 1; idx < lines.length; idx++) {
    const cols = parseCsvLine(lines[idx]);
    if (cols.length < 15) continue;

    const orgName = cols[0] || 'SCOOTSY LOGISTICS PRIVATE LIMITED';
    const vendorName = cols[1] || 'The Brothers and Co';
    const vendorCode = cols[2] || '1N96368405';
    const gstin = cols[3] || '19BRXPA0554J1ZF';
    const pan = cols[4] || 'BRXPA0554J';
    const warehouseName = cols[5] || 'Corporate Direct';
    const city = cols[6] || (warehouseName.includes('BLR') ? 'Bengaluru' : warehouseName.includes('KOL') ? 'Kolkata' : warehouseName.includes('CHE') ? 'Chennai' : warehouseName.includes('MUM') ? 'Mumbai' : warehouseName.includes('HYD') ? 'Hyderabad' : warehouseName.includes('Viz') ? 'Visakhapatnam' : warehouseName.includes('DLHY') ? 'Delhi NCR' : warehouseName.includes('PUN') ? 'Pune' : 'Other');
    const state = cols[7] || (city === 'Bengaluru' ? 'Karnataka' : city === 'Kolkata' ? 'West Bengal' : city === 'Chennai' ? 'Tamil Nadu' : city === 'Mumbai' ? 'Maharashtra' : city === 'Hyderabad' ? 'Telangana' : city === 'Delhi NCR' ? 'Haryana' : 'India');
    const statusOfInvoice = cols[8] || 'Posted';
    const poNumber = cols[9] || '';
    const poDate = cols[10] || '';
    const poAmount = parseINR(cols[11]);
    const grnNumber = cols[12] || '';
    const grnDate = cols[13] || '';
    const grossGrnAmount = parseINR(cols[14]);
    const invoiceNumber = cols[15] || `INV-${idx}`;
    const invoiceAccountingDate = cols[16] || '';
    const invoicesRecorded = parseINR(cols[17]);
    const tdsTcs = parseINR(cols[18]);
    const purchaseReturnAmount = parseINR(cols[19]);
    const brandDiscountPromoClaims = parseINR(cols[20]);
    const otherDebitAmount = parseINR(cols[21]);
    const otherAdjustments = parseINR(cols[22]);
    const netPayableAmount = parseINR(cols[23]);
    const otherAdjustmentDate = cols[24] || '';
    const invoiceStatus = cols[25] || 'Reconciled';
    const paymentAmount = parseINR(cols[26]);
    const paymentReferenceNo = cols[27] || '';
    const outstandingPayment = parseINR(cols[28]);
    const dueDate = cols[29] || '';
    const creditPeriod = parseInt(cols[30] || '30', 10) || 30;
    const overdueStatus = cols[31] || 'Not Due';
    const paymentStatus = cols[32] || (outstandingPayment <= 0 ? 'Paid' : paymentAmount > 0 ? 'Partially Paid' : 'Unpaid');
    const lastPaymentDate = cols[33] || '';

    const totalDeductions = tdsTcs + purchaseReturnAmount + brandDiscountPromoClaims + otherDebitAmount + otherAdjustments;

    // Calculate aging bucket
    let agingBucket: InvoiceRecord['agingBucket'] = 'Not Due';
    if (paymentStatus === 'Paid') {
      agingBucket = 'Paid';
    } else if (overdueStatus === 'Overdue') {
      agingBucket = '31-60 days'; // default overdue
    }

    records.push({
      id: `inv-${idx}-${invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_')}`,
      organizationName: orgName,
      vendorName,
      vendorCode,
      gstin,
      pan,
      warehouseName,
      city,
      state,
      statusOfInvoice,
      poNumber,
      poDate,
      poAmount,
      grnNumber,
      grnDate,
      grossGrnAmount,
      invoiceNumber,
      invoiceAccountingDate,
      invoicesRecorded,
      tdsTcs,
      purchaseReturnAmount,
      brandDiscountPromoClaims,
      otherDebitAmount,
      otherAdjustments,
      netPayableAmount,
      otherAdjustmentDate,
      invoiceStatus,
      paymentAmount,
      paymentReferenceNo,
      outstandingPayment,
      dueDate,
      creditPeriod,
      overdueStatus,
      paymentStatus,
      lastPaymentDate,
      totalDeductions,
      agingBucket
    });
  }

  return records;
}

// Generate the corresponding Point 2 Payment Records based on bank payments & remittance
export function deriveInitialPayments(invoices: InvoiceRecord[]): PaymentRecord[] {
  const paymentMap = new Map<string, {
    ref: string;
    date: string;
    totalAmount: number;
    invoices: string[];
    orgName: string;
    vendorName: string;
    vendorCode: string;
    gstin: string;
    pan: string;
  }>();

  for (const inv of invoices) {
    if (!inv.paymentReferenceNo || inv.paymentAmount <= 0) continue;

    // Handle multiple references (e.g. "REF1, REF2")
    const refs = inv.paymentReferenceNo.split(',').map(r => r.trim()).filter(Boolean);
    const amountPerRef = refs.length > 0 ? inv.paymentAmount / refs.length : inv.paymentAmount;

    for (const ref of refs) {
      const existing = paymentMap.get(ref);
      if (existing) {
        existing.totalAmount += amountPerRef;
        if (!existing.invoices.includes(inv.invoiceNumber)) {
          existing.invoices.push(inv.invoiceNumber);
        }
      } else {
        paymentMap.set(ref, {
          ref,
          date: inv.lastPaymentDate || inv.invoiceAccountingDate || '21-08-2026',
          totalAmount: amountPerRef,
          invoices: [inv.invoiceNumber],
          orgName: inv.organizationName,
          vendorName: inv.vendorName,
          vendorCode: inv.vendorCode,
          gstin: inv.gstin,
          pan: inv.pan,
        });
      }
    }
  }

  const payments: PaymentRecord[] = [];
  let pIdx = 1;

  paymentMap.forEach((val) => {
    payments.push({
      id: `pmt-${pIdx++}`,
      organizationName: val.orgName,
      vendorName: val.vendorName,
      vendorCode: val.vendorCode,
      gstin: val.gstin,
      pan: val.pan,
      tradeVendorType: 'Goods / Grocery Supplier',
      paymentType: val.ref.startsWith('HSBC') ? 'NEFT / HSBC Direct' : 'RTGS',
      paymentDate: val.date,
      paymentNumber: `PAY-2026-${1000 + pIdx}`,
      paymentReferenceNo: val.ref,
      amount: Math.round(val.totalAmount * 100) / 100,
      reversal: 0.00,
      netAmount: Math.round(val.totalAmount * 100) / 100,
      linkedInvoices: val.invoices,
      matchedInvoiceCount: val.invoices.length
    });
  });

  return payments;
}

export const INITIAL_INVOICES = parseRawInvoiceCsv(RAW_SAMPLE_INVOICE_CSV);
export const INITIAL_PAYMENTS = deriveInitialPayments(INITIAL_INVOICES);
