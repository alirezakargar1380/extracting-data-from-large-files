import languagesModel from "../models/languages.model"
import { ObjectId } from "mongodb"

let multiLanguages: any[] = []

export const addMultiLanguages = async (data: any, userId: ObjectId) => {
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        multiLanguages.push({
            document: {
                userId: userId,
                title: element.name,
                proficiency: element.proficiency
            }
        })
    }

    // if (multiLanguages.length >= 30000) {
    //     await bulkLanguages()
    // }
}

export const bulkLanguages = async () => {
    if (!multiLanguages.length) return
    await languagesModel.bulkWrite(multiLanguages.map(item => ({
        insertOne: item
    })), {
        ordered: false
    })
    multiLanguages = []
}

export const addLanguages = async (data:any, userId:ObjectId) => {
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        await languagesModel.create({
            userId: userId,
            title: element.name,
            proficiency: element.proficiency
        })
    }
}