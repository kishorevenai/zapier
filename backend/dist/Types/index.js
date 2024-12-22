"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZapCreateSchema = exports.SigninData = exports.SignupData = void 0;
const zod_1 = require("zod");
exports.SignupData = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
    name: zod_1.z.string(),
});
exports.SigninData = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
exports.ZapCreateSchema = zod_1.z.object({
    availableTriggerId: zod_1.z.string(),
    triggerMetadata: zod_1.z.any().optional(),
    actions: zod_1.z.array(zod_1.z.object({
        availableActionId: zod_1.z.string(),
        actionMetadata: zod_1.z.any().optional(),
    })),
});
