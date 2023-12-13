const { Client } = require('@elastic/elasticsearch')
var fs = require('fs'), es = require('event-stream');
const fileNames: any = []
let documents: any = []
let body: any = []

const folderAddress = "./db3"
const readedLine = 1000
const readedLineLog = 50000
const query: boolean = !false
let readed_file_num = 1
const rest = 1 // rest after extracing 4 files
const minuts_for_rest = 5

let start_date = new Date()

const client = new Client({
    node: 'http://localhost:9200',
    // node: 'https://elastic:XhpPn_2F7ngR2fJEDb+s@10.202.0.2:9200',
    ssl: {
        rejectUnauthorized: false,
    },
    auth: {
        username: 'elastic',
        password: 'FxYfdQivY4ZUiN83OdXP'
    },
    requestTimeout: 90000
})
const indexName = "all_data"
// const indexName = "merge_3"

// const sleep = (time: number) => { 
//		return new promise((resolve, reject) => {
//			setTimeout		
//		})
// }

const readFileNames = async () => {
    return new Promise((resolve, reject) => {
        fs.readdir(folderAddress, (err: any, files: any) => {
            files.forEach((file: any) => {
                fileNames.push(file)
            });
            resolve(true)
        });
    })
}

const sendFileNamesToFileReader = async () => {
    if (query) {
        console.log("...")
        const result = await client.search({
            index: indexName,
            body: {
                size: 100,
                query: {
                    bool: {
                        must: [
                            // {
                            //     match: {
                            //         regions: 'new jersey, united states'
                            //     }
                            // },
                            {
                                match: {
                                    skills: 'java'
                                }
                            },
                            {
                                match: {
                                    "experience.title.role": 'engineering'
                                }
                            },
                            // {
                            //     match: {
                            //         "experience.title.name": 'software engineer'
                            //     }
                            // },
                            // {
                            //     match: {
                            //         "experience.company.name": 'profecta.io'
                            //     }
                            // },
                            // {
                            //     match: {
                            //         job_company_location_continent: 'north america'
                            //     }
                            // },
                            {
                                regexp: {
                                    // countries: 'united states'
                                    countries: 'japan'
                                }
                            }
                        ]
                    }
                }
            }
        }, (err: any, result: any) => {
            if (err) console.log(err)
            // console.log('result', result)
            
            let index = 0

            // console.log('result', result.body.hits.hits[index]._source.experience)
            // console.log('result', result.body.hits.hits[index]._source.countries)
            // return

            for (let i = 0; i < result.body.hits.hits.length; i++) {


                console.log("<<<<<<<<<-------------------------------------------->>>>>>>>>>")
                // console.log(result.body.hits.hits[i]._source)
                console.log(result.body.hits.hits[i]._source.regions)
                console.log(result.body.hits.hits[i]._source.countries)
                // console.log(result.body.hits.hits[i]._source.skills)
                // for (let j = 0; j < result.body.hits.hits[i]._source.experience.length; j++) {
                //     console.log(result.body.hits.hits[i]._source.experience[j])
                // }

            }

            // console.log(result.body.hits.hits[index]._source)
            // console.log(result.body.hits.hits[index]._source.skills)
            // console.log(result.body.hits.hits[index]._source.countries)
            // console.log(result.body.hits.hits[index]._source.experience[0].company)
        })
    } else {
        await readFileNames()
        console.log(fileNames)
        for (let i = 0; i < fileNames.length; i++) {
            await fileReader(folderAddress + "/" + fileNames[i])
        }
    }

    return

}
sendFileNamesToFileReader()

function isJson(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const fileReader = (fileAddress: string) => {
    return new Promise(async (resolve, reject) => {
        start_date = new Date()
        // if (readed_file_num % rest === 0 && readed_file_num !== 1) {
        //     console.log("---->>>>>>>>>>>>>>>>>>>>>>>>>>>> wating time", rest, minuts_for_rest, readed_file_num)
        //     await new Promise((resolve) => setTimeout(resolve, minuts_for_rest * (60 * 1000)));
        // }

        var lineNr = 0;
        console.log("start:", new Date())
        console.log(fileAddress)
        var s = fs.createReadStream(fileAddress, { highWaterMark: 1 * 1024 * 1024 })
            .pipe(es.split())
            .pipe(es.mapSync(async (line: any) => {

                if (!isJson(line)) return s.resume();
                lineNr++;

                // console.log("im in line:", lineNr, new Date(), fileAddress)

                const json = JSON.parse(line)

                // ------------------------------------------------------------------- test code
                // s.pause();
                // await client.search({
                //     index: indexName,
                //     body: {
                //         size: 1,
                //         query: {
                //             bool: {
                //                 must: [
                //                     {
                //                         match: {
                //                             id: json?.id
                //                         }
                //                     }
                //                 ]
                //             }
                //         }
                //     }
                // }, (err: any, result: any) => {
                //     if (err) console.log(err)
                //     console.log(result.body.hits.hits, json.id)
                //     if (!result.body.hits.hits.length) console.log(json.id, "was not found")

                //     s.resume();
                // })
                // return resolve(true)
                // ------------------------------------------------------------------- test code

                documents.push(json)

                if (lineNr % readedLine === 0) {
                    // pause the readstream
                    s.pause();

                    if (lineNr % readedLineLog === 0) {
                        console.log("im in line:", lineNr, new Date(), fileAddress)
                        // console.log("----> s", new Date())
                    }

                    for (const document of documents) {
                        // console.log(document)
                        body.push({
                            index: {
                                _index: indexName,
                                // _id: `${id}`
                            }
                        });
                        // id++
                        body.push(document);
                    }

                    // test
                    await insert()


                    if (lineNr % readedLineLog === 0) console.log("----> e", new Date())

                    s.resume();
                }

            }).on('error', function (err: any) {
                console.log('Error while reading file.', err);
                reject(true)
            })
                .on('end', async function () {
                    readed_file_num++
                    for (const document of documents) {
                        // console.log(document)
                        body.push({
                            index: {
                                _index: indexName,
                                // _id: `${id}`
                            }
                        });
                        // id++
                        body.push(document);
                    }
                    console.log(body.length)
                    console.log(documents.length)
                    await insert()
                    console.log("all lines:", lineNr)
                    let end_date = new Date()

                    // Calculate the difference in milliseconds
                    const time_difference = end_date.getTime() - start_date.getTime();

                    // Convert the difference to minutes
                    const minutes_difference = Math.floor(time_difference / (1000 * 60));

                    console.log(`The process in minutes is: ${ minutes_difference }`);


                    console.log("finish", new Date())
                    console.log('Read entire file.', fileAddress)
                    resolve(true)
                })
            );
    })
}

const insert = async (): Promise<any> => {
    try {
        let res = await client.bulk({
            body: body
        })
        documents = []
        body = []
        return res
    } catch (e) {
        console.log("******************* ERR while inserting *******************")
        console.log(body.length)
        console.log(documents.length)
        console.log(e)
        await new Promise((resolve) => setTimeout(resolve, 16 * 1000));
        return await insert()
    }
}