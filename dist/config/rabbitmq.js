"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_DLQ = exports.QUEUE_RETRY = exports.RK_DLQ = exports.RK_RETRY = exports.RK_MAIN = exports.QUEUE = exports.EXCHANGE = void 0;
exports.ensureChannel = ensureChannel;
exports.getRabbitChannel = getRabbitChannel;
const amqp = __importStar(require("amqplib"));
//let connection: amqp.Connection | null = null;
let channel = null;
/** Variables standardisées */
exports.EXCHANGE = process.env.RABBITMQ_EXCHANGE;
exports.QUEUE = process.env.RABBITMQ_QUEUE;
/** Routing keys internes */
exports.RK_MAIN = "notification.process";
exports.RK_RETRY = "notification.retry";
exports.RK_DLQ = "notification.dlq";
/** Queues dérivées (privées au service) */
exports.QUEUE_RETRY = `${exports.QUEUE}.retry`;
exports.QUEUE_DLQ = `${exports.QUEUE}.dlq`;
async function ensureChannel() {
    if (channel)
        return channel;
    try {
        console.log("Tentative de connexion à RabbitMQ...");
        let connection = await amqp.connect(process.env.RABBITMQ_URL);
        // garder une référence locale non-nulle pour satisfaire TypeScript
        const conn = connection;
        conn.on("close", () => {
            console.error("RabbitMQ fermé – reconnexion...");
            // channel = null;
            //connection = null;
            setTimeout(ensureChannel, 3000);
        });
        conn.on("error", (err) => {
            console.error("Erreur RabbitMQ:", err);
        });
        channel = await conn.createChannel();
        const ch = channel;
        // Exchange partagé (doit être le même que celui utilisé par wallet-service, ex: "ricash.events")
        await ch.assertExchange(exports.EXCHANGE, "topic", { durable: true });
        // Queue principale
        await ch.assertQueue(exports.QUEUE, { durable: true });
        // événements venant du wallet-service
        await ch.bindQueue(exports.QUEUE, exports.EXCHANGE, "wallet.*");
        await ch.bindQueue(exports.QUEUE, exports.EXCHANGE, "wallet.transfer.*");
        // événements OTP (ex: "otp.verification")
        await ch.bindQueue(exports.QUEUE, exports.EXCHANGE, "otp.*");
        // routing key interne historique du service de notifications
        await ch.bindQueue(exports.QUEUE, exports.EXCHANGE, exports.RK_MAIN);
        // Queue retry
        await ch.assertQueue(exports.QUEUE_RETRY, {
            durable: true,
            arguments: {
                "x-message-ttl": 5000,
                "x-dead-letter-exchange": exports.EXCHANGE,
                "x-dead-letter-routing-key": exports.RK_MAIN,
            },
        });
        await ch.bindQueue(exports.QUEUE_RETRY, exports.EXCHANGE, exports.RK_RETRY);
        // DLQ
        await ch.assertQueue(exports.QUEUE_DLQ, { durable: true });
        await ch.bindQueue(exports.QUEUE_DLQ, exports.EXCHANGE, exports.RK_DLQ);
        console.log(`RabbitMQ prêt pour la queue ${exports.QUEUE}`);
        return ch;
    }
    catch (err) {
        console.error("Erreur de connexion RabbitMQ:", err);
        throw err;
    }
}
function getRabbitChannel() {
    if (!channel) {
        throw new Error("RabbitMQ non initialisé !");
    }
    return channel;
}
