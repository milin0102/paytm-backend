const zod = require("zod");

const signUpBodySchema = zod.object({
    email:zod.string().email(),
    userName:zod.string().min(6),
    firstName:zod.string(),
    lastName:zod.string(),
    password:zod.string()
})

const updateBodySchema = zod.object({
    firstName:zod.string(),
    lastName:zod.string()
})

module.exports = {
    signUpBodySchema,
    updateBodySchema
}