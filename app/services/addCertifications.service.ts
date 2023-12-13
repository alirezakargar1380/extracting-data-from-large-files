import { ObjectId } from "mongodb";
import certificationsModel from "../models/certifications.model";

let multiCertifications: any[] = []

export const addMultiCertifications = async (data: any, userId: ObjectId) => {
    for (let i = 0; i < data.length; i++) {
        data[i].userId = userId
        multiCertifications.push({
            document: data[i]
        })
    }

    // if (multiCertifications.length >= 25000) {
    //     await bulkCertifications()
    // }
}


export const bulkCertifications = async () => {
    try {
        if (!multiCertifications.length) return
        await certificationsModel.bulkWrite(multiCertifications.map(item => ({
            insertOne: item
        })), {
            ordered: false
        })
        multiCertifications = []
    } catch (error) {
        console.log(error)
    }

}


export const addCertifications = (data: any, userId: ObjectId) => {
    for (let i = 0; i < data.length; i++) {
        data[i].userId = userId
    }
    return certificationsModel.insertMany(data)
}