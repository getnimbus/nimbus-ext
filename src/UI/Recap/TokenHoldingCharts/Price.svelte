<script>
  import { SparkLine } from "svelte-spark";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Loading from "~/components/Loading.svelte";

  export let data;
  export let loading;

  const solanaPrice = [
    {
      timestamp: 1672332897,
      price: 9.436208245302664,
    },
    {
      timestamp: 1672419331,
      price: 9.610760759603862,
    },
    {
      timestamp: 1672505696,
      price: 10.090815523688581,
    },
    {
      timestamp: 1672592095,
      price: 9.88903857638477,
    },
    {
      timestamp: 1672678500,
      price: 11.125307317290066,
    },
    {
      timestamp: 1672764927,
      price: 13.341706616215708,
    },
    {
      timestamp: 1672851300,
      price: 13.512683789064903,
    },
    {
      timestamp: 1672937723,
      price: 13.170180812841723,
    },
    {
      timestamp: 1673024136,
      price: 13.184289508306954,
    },
    {
      timestamp: 1673110528,
      price: 13.20564704461957,
    },
    {
      timestamp: 1673196900,
      price: 13.717689646160458,
    },
    {
      timestamp: 1673283294,
      price: 17.1524158382391,
    },
    {
      timestamp: 1673369686,
      price: 16.162535249295097,
    },
    {
      timestamp: 1673456099,
      price: 15.404950717497046,
    },
    {
      timestamp: 1673542502,
      price: 15.990392853589844,
    },
    {
      timestamp: 1673628899,
      price: 16.71727842230133,
    },
    {
      timestamp: 1673715301,
      price: 22.65376607794313,
    },
    {
      timestamp: 1673801526,
      price: 23.22,
    },
    {
      timestamp: 1673888120,
      price: 23.048383202899313,
    },
    {
      timestamp: 1673974529,
      price: 23.35563241945021,
    },
    {
      timestamp: 1674060928,
      price: 20.910866275885613,
    },
    {
      timestamp: 1674147297,
      price: 21.200268616775155,
    },
    {
      timestamp: 1674233766,
      price: 22.130248218284578,
    },
    {
      timestamp: 1674320092,
      price: 25.56664638943289,
    },
    {
      timestamp: 1674406510,
      price: 25.013031985012894,
    },
    {
      timestamp: 1674492896,
      price: 24.310204979469482,
    },
    {
      timestamp: 1674579294,
      price: 24.355578078393194,
    },
    {
      timestamp: 1674665725,
      price: 23.527514143393173,
    },
    {
      timestamp: 1674752109,
      price: 24.290021140092133,
    },
    {
      timestamp: 1674838527,
      price: 24.12558647931757,
    },
    {
      timestamp: 1674925087,
      price: 24.13,
    },
    {
      timestamp: 1675011287,
      price: 24.87937817427373,
    },
    {
      timestamp: 1675097697,
      price: 24.336222434771077,
    },
    {
      timestamp: 1675184102,
      price: 24.14013654073919,
    },
    {
      timestamp: 1675270472,
      price: 22.804233778139626,
    },
    {
      timestamp: 1675356894,
      price: 25.135219838063968,
    },
    {
      timestamp: 1675442928,
      price: 24.96,
    },
    {
      timestamp: 1675529873,
      price: 24.59,
    },
    {
      timestamp: 1675616264,
      price: 23.49,
    },
    {
      timestamp: 1675702685,
      price: 23.33,
    },
    {
      timestamp: 1675789080,
      price: 23.07,
    },
    {
      timestamp: 1675875467,
      price: 23.14,
    },
    {
      timestamp: 1675961694,
      price: 22.492263323125027,
    },
    {
      timestamp: 1676048266,
      price: 20.75,
    },
    {
      timestamp: 1676134634,
      price: 20.4,
    },
    {
      timestamp: 1676221066,
      price: 21.68,
    },
    {
      timestamp: 1676307169,
      price: 20.38,
    },
    {
      timestamp: 1676393882,
      price: 21.72,
    },
    {
      timestamp: 1676480123,
      price: 22.35116245769079,
    },
    {
      timestamp: 1676566683,
      price: 23.74,
    },
    {
      timestamp: 1676653070,
      price: 22.73,
    },
    {
      timestamp: 1676739460,
      price: 23.75,
    },
    {
      timestamp: 1676825581,
      price: 24.81,
    },
    {
      timestamp: 1676912274,
      price: 26.03,
    },
    {
      timestamp: 1676998667,
      price: 24.9,
    },
    {
      timestamp: 1677085065,
      price: 23.5,
    },
    {
      timestamp: 1677171482,
      price: 23.83,
    },
    {
      timestamp: 1677257881,
      price: 22.84,
    },
    {
      timestamp: 1677344251,
      price: 22.24,
    },
    {
      timestamp: 1677430651,
      price: 22.86,
    },
    {
      timestamp: 1677517057,
      price: 22.86,
    },
    {
      timestamp: 1677603474,
      price: 22.44,
    },
    {
      timestamp: 1677689879,
      price: 22.53,
    },
    {
      timestamp: 1677776280,
      price: 21.72,
    },
    {
      timestamp: 1677862528,
      price: 21.21599662916932,
    },
    {
      timestamp: 1677948776,
      price: 21.01,
    },
    {
      timestamp: 1678035477,
      price: 21.25,
    },
    {
      timestamp: 1678121836,
      price: 21.02,
    },
    {
      timestamp: 1678208282,
      price: 20.16,
    },
    {
      timestamp: 1678294665,
      price: 19.2,
    },
    {
      timestamp: 1678380942,
      price: 18.20901123817045,
    },
    {
      timestamp: 1678467339,
      price: 17.835906604279916,
    },
    {
      timestamp: 1678553721,
      price: 17.375381449046298,
    },
    {
      timestamp: 1678640138,
      price: 18.132299310306816,
    },
    {
      timestamp: 1678812948,
      price: 21.67456545840965,
    },
    {
      timestamp: 1678899323,
      price: 19.049804280439695,
    },
    {
      timestamp: 1678985852,
      price: 19.6,
    },
    {
      timestamp: 1679072241,
      price: 20.08,
    },
    {
      timestamp: 1679158498,
      price: 22.135483994239674,
    },
    {
      timestamp: 1679245074,
      price: 22.44,
    },
    {
      timestamp: 1679331183,
      price: 23.33,
    },
    {
      timestamp: 1679417714,
      price: 23.153596029685932,
    },
    {
      timestamp: 1679504129,
      price: 22.801343431973255,
    },
    {
      timestamp: 1679590535,
      price: 22.436135144976326,
    },
    {
      timestamp: 1679676925,
      price: 21.08844913383615,
    },
    {
      timestamp: 1679763305,
      price: 20.83728786468941,
    },
    {
      timestamp: 1679849878,
      price: 20.78,
    },
    {
      timestamp: 1679936501,
      price: 19.72,
    },
    {
      timestamp: 1680022528,
      price: 20.19229661474132,
    },
    {
      timestamp: 1680108900,
      price: 21.057863415679854,
    },
    {
      timestamp: 1680195473,
      price: 20.41,
    },
    {
      timestamp: 1680281868,
      price: 20.95,
    },
    {
      timestamp: 1680368270,
      price: 20.86,
    },
    {
      timestamp: 1680454526,
      price: 20.613545146364636,
    },
    {
      timestamp: 1680541066,
      price: 20.29,
    },
    {
      timestamp: 1680627461,
      price: 20.86,
    },
    {
      timestamp: 1680713862,
      price: 20.68,
    },
    {
      timestamp: 1680800267,
      price: 20.78,
    },
    {
      timestamp: 1680886674,
      price: 20.49,
    },
    {
      timestamp: 1680973066,
      price: 20.45,
    },
    {
      timestamp: 1681059465,
      price: 20.13,
    },
    {
      timestamp: 1681145864,
      price: 20.47,
    },
    {
      timestamp: 1681232270,
      price: 23.4,
    },
    {
      timestamp: 1681318670,
      price: 23.71,
    },
    {
      timestamp: 1681405065,
      price: 24.54,
    },
    {
      timestamp: 1681491465,
      price: 23.93,
    },
    {
      timestamp: 1681577868,
      price: 24.36,
    },
    {
      timestamp: 1681664263,
      price: 24.35,
    },
    {
      timestamp: 1681750673,
      price: 24.61,
    },
    {
      timestamp: 1681837070,
      price: 24.78,
    },
    {
      timestamp: 1681923465,
      price: 23.35,
    },
    {
      timestamp: 1682009865,
      price: 22.18,
    },
    {
      timestamp: 1682096270,
      price: 21.77,
    },
    {
      timestamp: 1682182667,
      price: 21.77,
    },
    {
      timestamp: 1682269069,
      price: 21.58,
    },
    {
      timestamp: 1682355470,
      price: 21.23,
    },
    {
      timestamp: 1682441863,
      price: 20.97,
    },
    {
      timestamp: 1682528270,
      price: 22.71,
    },
    {
      timestamp: 1682614670,
      price: 22.09,
    },
    {
      timestamp: 1682701068,
      price: 22.86,
    },
    {
      timestamp: 1682787470,
      price: 23.33,
    },
    {
      timestamp: 1682873864,
      price: 23.7,
    },
    {
      timestamp: 1682960266,
      price: 21.9,
    },
    {
      timestamp: 1683046668,
      price: 22.16,
    },
    {
      timestamp: 1683133064,
      price: 21.38,
    },
    {
      timestamp: 1683219465,
      price: 21.93,
    },
    {
      timestamp: 1683305864,
      price: 22.46,
    },
    {
      timestamp: 1683392264,
      price: 21.91,
    },
    {
      timestamp: 1683478665,
      price: 22.51,
    },
    {
      timestamp: 1683565066,
      price: 21.12,
    },
    {
      timestamp: 1683651467,
      price: 20.67,
    },
    {
      timestamp: 1683737869,
      price: 21.1,
    },
    {
      timestamp: 1683824267,
      price: 20.18,
    },
    {
      timestamp: 1683910667,
      price: 20.31,
    },
    {
      timestamp: 1683997071,
      price: 20.92,
    },
    {
      timestamp: 1684083467,
      price: 21.07,
    },
    {
      timestamp: 1684169872,
      price: 21.37,
    },
    {
      timestamp: 1684256268,
      price: 20.78,
    },
    {
      timestamp: 1684342668,
      price: 20.77,
    },
    {
      timestamp: 1684429067,
      price: 20.56,
    },
    {
      timestamp: 1684515471,
      price: 20.4,
    },
    {
      timestamp: 1684601870,
      price: 20.24,
    },
    {
      timestamp: 1684688265,
      price: 19.93,
    },
    {
      timestamp: 1684774669,
      price: 19.68,
    },
    {
      timestamp: 1684861061,
      price: 20.05,
    },
    {
      timestamp: 1684947469,
      price: 19.09,
    },
    {
      timestamp: 1685033870,
      price: 19.24,
    },
    {
      timestamp: 1685120270,
      price: 19.43,
    },
    {
      timestamp: 1685206665,
      price: 19.59,
    },
    {
      timestamp: 1685293067,
      price: 20.54,
    },
    {
      timestamp: 1685379161,
      price: 20.34,
    },
    {
      timestamp: 1685465868,
      price: 21.11,
    },
    {
      timestamp: 1685552266,
      price: 20.48,
    },
    {
      timestamp: 1685638681,
      price: 20.86,
    },
    {
      timestamp: 1685725067,
      price: 21.1,
    },
    {
      timestamp: 1685811469,
      price: 21.24,
    },
    {
      timestamp: 1685897866,
      price: 22.08,
    },
    {
      timestamp: 1685984268,
      price: 19.98,
    },
    {
      timestamp: 1686070662,
      price: 20.08,
    },
    {
      timestamp: 1686157064,
      price: 19.11,
    },
    {
      timestamp: 1686243471,
      price: 18.71,
    },
    {
      timestamp: 1686329868,
      price: 18.54,
    },
    {
      timestamp: 1686416266,
      price: 14.71,
    },
    {
      timestamp: 1686502668,
      price: 15.46,
    },
    {
      timestamp: 1686589069,
      price: 15.19,
    },
    {
      timestamp: 1686675463,
      price: 14.93,
    },
    {
      timestamp: 1686761864,
      price: 15.17,
    },
    {
      timestamp: 1686848270,
      price: 14.46,
    },
    {
      timestamp: 1686934670,
      price: 14.91,
    },
    {
      timestamp: 1687021069,
      price: 15.72,
    },
    {
      timestamp: 1687107468,
      price: 15.76,
    },
    {
      timestamp: 1687193871,
      price: 15.53,
    },
    {
      timestamp: 1687280266,
      price: 16.07,
    },
    {
      timestamp: 1687366668,
      price: 17.05,
    },
    {
      timestamp: 1687453069,
      price: 16.97,
    },
    {
      timestamp: 1687539465,
      price: 17.06,
    },
    {
      timestamp: 1687625875,
      price: 16.64,
    },
    {
      timestamp: 1687712263,
      price: 17.17,
    },
    {
      timestamp: 1687798671,
      price: 16.45,
    },
    {
      timestamp: 1687885069,
      price: 16.69,
    },
    {
      timestamp: 1687971462,
      price: 16.32,
    },
    {
      timestamp: 1688057869,
      price: 17.64,
    },
    {
      timestamp: 1688144261,
      price: 18.96,
    },
    {
      timestamp: 1688230664,
      price: 18.35,
    },
    {
      timestamp: 1688317069,
      price: 19.43,
    },
    {
      timestamp: 1688403465,
      price: 19.1,
    },
    {
      timestamp: 1688489872,
      price: 19.66,
    },
    {
      timestamp: 1688576271,
      price: 18.74,
    },
    {
      timestamp: 1688662670,
      price: 19.68,
    },
    {
      timestamp: 1688749064,
      price: 21.39,
    },
    {
      timestamp: 1688835463,
      price: 21.86,
    },
    {
      timestamp: 1688921863,
      price: 21.31,
    },
    {
      timestamp: 1689008273,
      price: 21.06,
    },
    {
      timestamp: 1689094664,
      price: 22.05,
    },
    {
      timestamp: 1689181067,
      price: 22.25,
    },
    {
      timestamp: 1689267465,
      price: 24.93,
    },
    {
      timestamp: 1689353865,
      price: 27.48,
    },
    {
      timestamp: 1689440265,
      price: 27.21,
    },
    {
      timestamp: 1689526669,
      price: 27.95,
    },
    {
      timestamp: 1689613070,
      price: 26.74,
    },
    {
      timestamp: 1689699469,
      price: 25.38,
    },
    {
      timestamp: 1689785865,
      price: 26.27,
    },
    {
      timestamp: 1689872262,
      price: 25.42,
    },
    {
      timestamp: 1689958660,
      price: 25.26,
    },
    {
      timestamp: 1690045070,
      price: 25.67,
    },
    {
      timestamp: 1690131468,
      price: 24.98,
    },
    {
      timestamp: 1690217865,
      price: 23.32,
    },
    {
      timestamp: 1690304263,
      price: 23.26,
    },
    {
      timestamp: 1690390668,
      price: 24.69,
    },
    {
      timestamp: 1690477062,
      price: 25.21,
    },
    {
      timestamp: 1690563462,
      price: 25.29,
    },
    {
      timestamp: 1690649864,
      price: 25.1,
    },
    {
      timestamp: 1690736262,
      price: 24.91,
    },
    {
      timestamp: 1690822667,
      price: 24.02,
    },
    {
      timestamp: 1690909073,
      price: 23.26,
    },
    {
      timestamp: 1690995473,
      price: 22.97,
    },
    {
      timestamp: 1691081867,
      price: 22.8,
    },
    {
      timestamp: 1691168265,
      price: 23.41,
    },
    {
      timestamp: 1691254659,
      price: 22.39,
    },
    {
      timestamp: 1691341064,
      price: 23.18,
    },
    {
      timestamp: 1691427465,
      price: 22.58,
    },
    {
      timestamp: 1691513867,
      price: 23.94,
    },
    {
      timestamp: 1691600269,
      price: 24.54,
    },
    {
      timestamp: 1691686667,
      price: 24.52,
    },
    {
      timestamp: 1691773062,
      price: 24.54,
    },
    {
      timestamp: 1691859465,
      price: 24.75,
    },
    {
      timestamp: 1691945869,
      price: 24.46,
    },
    {
      timestamp: 1692032263,
      price: 25.1,
    },
    {
      timestamp: 1692118514,
      price: 24.701085601491723,
    },
    {
      timestamp: 1692204927,
      price: 23.159799837857356,
    },
    {
      timestamp: 1692291323,
      price: 23.051357902022268,
    },
    {
      timestamp: 1692377736,
      price: 21.32,
    },
    {
      timestamp: 1692464124,
      price: 22.06616063260398,
    },
    {
      timestamp: 1692550499,
      price: 21.665584160247104,
    },
    {
      timestamp: 1692636901,
      price: 20.993367105947183,
    },
    {
      timestamp: 1692723327,
      price: 20.58967080571964,
    },
    {
      timestamp: 1692809731,
      price: 21.274748132010675,
    },
    {
      timestamp: 1692896119,
      price: 21.11321699793135,
    },
    {
      timestamp: 1692982528,
      price: 20.32449577782083,
    },
    {
      timestamp: 1693068919,
      price: 20.26897561244576,
    },
    {
      timestamp: 1693155300,
      price: 20.73974639245454,
    },
    {
      timestamp: 1693241719,
      price: 20.57416878425467,
    },
    {
      timestamp: 1693328150,
      price: 21.63350745787413,
    },
    {
      timestamp: 1693414521,
      price: 20.654585607446826,
    },
    {
      timestamp: 1693500919,
      price: 19.973632430838215,
    },
    {
      timestamp: 1693587347,
      price: 19.38195574385926,
    },
    {
      timestamp: 1693673754,
      price: 19.470624359075963,
    },
    {
      timestamp: 1693760117,
      price: 19.269825573418363,
    },
    {
      timestamp: 1693846550,
      price: 19.376667157064798,
    },
    {
      timestamp: 1693932929,
      price: 20.303940546916795,
    },
    {
      timestamp: 1694019307,
      price: 19.369920506975276,
    },
    {
      timestamp: 1694105707,
      price: 19.64,
    },
    {
      timestamp: 1694192110,
      price: 19.42,
    },
    {
      timestamp: 1694278506,
      price: 19.53,
    },
    {
      timestamp: 1694364906,
      price: 17.98,
    },
    {
      timestamp: 1694451302,
      price: 17.75061689665257,
    },
    {
      timestamp: 1694537709,
      price: 18.01,
    },
    {
      timestamp: 1694624118,
      price: 18.444615257701575,
    },
    {
      timestamp: 1694710543,
      price: 18.997704889376113,
    },
    {
      timestamp: 1694796950,
      price: 18.881950987944123,
    },
    {
      timestamp: 1694883308,
      price: 19.01,
    },
    {
      timestamp: 1694969743,
      price: 18.9281204314477,
    },
    {
      timestamp: 1695056108,
      price: 20,
    },
    {
      timestamp: 1695142521,
      price: 20.040392779399223,
    },
    {
      timestamp: 1695228948,
      price: 20.166180853853152,
    },
    {
      timestamp: 1695401711,
      price: 19.352790524590493,
    },
    {
      timestamp: 1695488107,
      price: 19.4,
    },
    {
      timestamp: 1695574512,
      price: 19.49195251694182,
    },
    {
      timestamp: 1695660907,
      price: 19.59,
    },
    {
      timestamp: 1695747355,
      price: 19.229011886080663,
    },
    {
      timestamp: 1695833749,
      price: 18.94963594405971,
    },
    {
      timestamp: 1695920102,
      price: 19.53,
    },
    {
      timestamp: 1696006507,
      price: 20.19,
    },
    {
      timestamp: 1696092942,
      price: 21.485454661256274,
    },
    {
      timestamp: 1696179352,
      price: 22.811676136390805,
    },
    {
      timestamp: 1696265702,
      price: 24.1,
    },
    {
      timestamp: 1696352115,
      price: 24.253241955083247,
    },
    {
      timestamp: 1696438557,
      price: 22.95313358051449,
    },
    {
      timestamp: 1696524917,
      price: 22.969582713282893,
    },
    {
      timestamp: 1696611327,
      price: 23.417157809400152,
    },
    {
      timestamp: 1696697721,
      price: 23.372577565970364,
    },
    {
      timestamp: 1696784101,
      price: 23.49,
    },
    {
      timestamp: 1696870525,
      price: 21.89631701532407,
    },
    {
      timestamp: 1696956905,
      price: 21.98,
    },
    {
      timestamp: 1697043327,
      price: 21.797207208555662,
    },
    {
      timestamp: 1697129699,
      price: 21.16,
    },
    {
      timestamp: 1697216099,
      price: 21.56,
    },
    {
      timestamp: 1697302501,
      price: 22.05,
    },
    {
      timestamp: 1697388902,
      price: 21.8,
    },
    {
      timestamp: 1697475305,
      price: 23.214849228660263,
    },
    {
      timestamp: 1697561703,
      price: 24.2,
    },
    {
      timestamp: 1697648106,
      price: 23.7,
    },
    {
      timestamp: 1697734503,
      price: 25,
    },
    {
      timestamp: 1697820908,
      price: 26.5,
    },
    {
      timestamp: 1697907298,
      price: 29.13,
    },
    {
      timestamp: 1697993705,
      price: 28.717436790846204,
    },
    {
      timestamp: 1698080116,
      price: 29.459638824801914,
    },
    {
      timestamp: 1698166500,
      price: 30.94,
    },
    {
      timestamp: 1698252902,
      price: 32.63,
    },
    {
      timestamp: 1698339304,
      price: 30.790133396144295,
    },
    {
      timestamp: 1698425697,
      price: 31.99,
    },
    {
      timestamp: 1698512105,
      price: 31.84,
    },
    {
      timestamp: 1698598502,
      price: 32.6,
    },
    {
      timestamp: 1698684900,
      price: 34.96,
    },
    {
      timestamp: 1698771305,
      price: 36.253757688765866,
    },
    {
      timestamp: 1698857699,
      price: 41.36,
    },
    {
      timestamp: 1698944100,
      price: 39.86,
    },
    {
      timestamp: 1699030500,
      price: 39.62713027184018,
    },
    {
      timestamp: 1699116920,
      price: 41.56392003324766,
    },
    {
      timestamp: 1699203325,
      price: 41.11,
    },
    {
      timestamp: 1699289728,
      price: 40.23,
    },
    {
      timestamp: 1699376124,
      price: 41.47,
    },
    {
      timestamp: 1699462528,
      price: 43.05,
    },
    {
      timestamp: 1699548940,
      price: 45.35584980857016,
    },
    {
      timestamp: 1699635321,
      price: 52.08,
    },
    {
      timestamp: 1699721730,
      price: 62.08,
    },
    {
      timestamp: 1699808132,
      price: 58.06162182491277,
    },
    {
      timestamp: 1699894528,
      price: 55.63,
    },
    {
      timestamp: 1699980928,
      price: 56.07,
    },
    {
      timestamp: 1700067319,
      price: 61.97,
    },
    {
      timestamp: 1700153724,
      price: 62.13,
    },
    {
      timestamp: 1700240125,
      price: 55.2,
    },
    {
      timestamp: 1700326521,
      price: 58.3,
    },
    {
      timestamp: 1700412926,
      price: 59.69,
    },
    {
      timestamp: 1700499320,
      price: 57.75,
    },
    {
      timestamp: 1700585725,
      price: 55.82,
    },
    {
      timestamp: 1700672125,
      price: 54.57,
    },
    {
      timestamp: 1700758524,
      price: 56.62,
    },
    {
      timestamp: 1700844925,
      price: 57.53,
    },
    {
      timestamp: 1700931327,
      price: 58.63,
    },
    {
      timestamp: 1701017722,
      price: 56.63,
    },
    {
      timestamp: 1701104129,
      price: 54.51,
    },
    {
      timestamp: 1701190528,
      price: 56.92,
    },
    {
      timestamp: 1701276925,
      price: 59.4,
    },
    {
      timestamp: 1701363319,
      price: 59.36938924442843,
    },
    {
      timestamp: 1701449725,
      price: 60.3,
    },
    {
      timestamp: 1701536129,
      price: 61.69139507644992,
    },
    {
      timestamp: 1701622524,
      price: 62.91,
    },
    {
      timestamp: 1701708928,
      price: 60.81,
    },
    {
      timestamp: 1701795325,
      price: 60.81,
    },
    {
      timestamp: 1701881724,
      price: 62.81,
    },
    {
      timestamp: 1701968123,
      price: 65.8,
    },
    {
      timestamp: 1702054528,
      price: 73.08,
    },
    {
      timestamp: 1702140920,
      price: 74.57,
    },
    {
      timestamp: 1702227329,
      price: 73.18,
    },
    {
      timestamp: 1702313722,
      price: 69.9,
    },
    {
      timestamp: 1702400116,
      price: 67.6,
    },
    {
      timestamp: 1702486512,
      price: 67.02,
    },
    {
      timestamp: 1702572918,
      price: 73.37,
    },
    {
      timestamp: 1702659326,
      price: 74.25,
    },
    {
      timestamp: 1702745711,
      price: 76.6717991268627,
    },
    {
      timestamp: 1702832121,
      price: 73.36,
    },
    {
      timestamp: 1702918527,
      price: 71.59,
    },
    {
      timestamp: 1703004923,
      price: 73.35,
    },
    {
      timestamp: 1703091328,
      price: 80.12,
    },
    {
      timestamp: 1703177724,
      price: 89.16,
    },
    {
      timestamp: 1703264117,
      price: 93.91,
    },
    {
      timestamp: 1703350520,
      price: 97.47,
    },
    {
      timestamp: 1703436923,
      price: 115.92,
    },
    {
      timestamp: 1703523326,
      price: 122.1,
    },
    {
      timestamp: 1703609716,
      price: 112.23,
    },
    {
      timestamp: 1703696121,
      price: 105.55,
    },
    {
      timestamp: 1703782528,
      price: 98.97,
    },
  ];

  $: percentChange =
    (Number(data?.price || 0) - solanaPrice[0].price) / solanaPrice[0].price;
</script>

<div class="w-[260px] flex flex-col gap-4 p-[24px] rounded-[20px] bg-black">
  <div class="flex flex-col gap-2">
    <div class="text-white text-xl font-medium">Solana price change</div>
    {#if !loading}
      <div class="flex items-center gap-2">
        <div class="text-[#F7FBFA] text-[30px]">
          $<TooltipNumber number={Number(data?.price || 0)} type="percent" />
        </div>
        <div class="flex items-center gap-1 font-medium text-base">
          {#if percentChange !== 0}
            <div
              class={`${
                percentChange >= 0 ? "text-[#00A878]" : "text-red-500"
              }`}
            >
              {#if percentChange >= 0}
                ↑
              {:else}
                ↓
              {/if}
            </div>
          {/if}
          <div
            class={`flex items-center ${
              percentChange !== 0
                ? percentChange >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : "text-[#F7FBFA]"
            }`}
          >
            <TooltipNumber
              number={Math.abs(percentChange) * 100}
              type="percent"
            />
            <span>%</span>
          </div>
        </div>
      </div>
    {/if}
  </div>
  {#if loading}
    <div class="flex justify-center items-center h-full h-[210px]">
      <Loading />
    </div>
  {:else}
    <SparkLine
      data={solanaPrice.map((item) => item.price) || []}
      width={210}
      height={40}
      color="#4A97CF"
    />
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>
