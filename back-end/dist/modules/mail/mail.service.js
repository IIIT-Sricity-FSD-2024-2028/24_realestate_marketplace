"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    configService;
    logger = new common_1.Logger(MailService_1.name);
    transporter;
    constructor(configService) {
        this.configService = configService;
        const mail = this.configService.get('mail');
        if (mail.host && mail.user && mail.pass) {
            this.transporter = nodemailer_1.default.createTransport({
                host: mail.host,
                port: mail.port,
                secure: mail.secure,
                auth: { user: mail.user, pass: mail.pass },
            });
        }
        else {
            this.transporter = null;
            this.logger.warn('No SMTP credentials configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — outbound emails will be ' +
                'logged to the server console instead of actually sent. Set them for real delivery.');
        }
    }
    async sendNewPasswordEmail(to, name, password, accountType) {
        const label = accountType ? `${accountType} account` : 'account';
        const subject = 'Your new truEstate password';
        const text = `Hi ${name},\n\n` +
            `You asked to recover the password for your truEstate ${label} (${to}).\n\n` +
            `Your new password is: ${password}\n\n` +
            'Your previous password no longer works. Log in with the password above, then change it from ' +
            "Settings → Change Password.\n\n" +
            "If you didn't request this, someone else may have — log in and change your password now.";
        const html = `<p>Hi ${escapeHtml(name)},</p>` +
            `<p>You asked to recover the password for your truEstate <strong>${escapeHtml(label)}</strong> ` +
            `(${escapeHtml(to)}).</p>` +
            '<p>Your new password is:</p>' +
            `<p style="font-size:1.25rem;font-weight:700;letter-spacing:0.05em;background:#f4f4f5;` +
            `border-radius:0.5rem;padding:0.75rem 1.25rem;display:inline-block;font-family:monospace;">` +
            `${escapeHtml(password)}</p>` +
            '<p>Your previous password no longer works. Log in with the password above, then change it ' +
            'from <strong>Settings → Change Password</strong>.</p>' +
            "<p>If you didn't request this, someone else may have — log in and change your password now.</p>";
        if (!this.transporter) {
            this.logger.log(`[DEV — no SMTP configured] New password for ${to}: ${password}`);
            return;
        }
        try {
            const mail = this.configService.get('mail');
            await this.transporter.sendMail({ from: mail.from, to, subject, text, html });
        }
        catch (error) {
            this.logger.error(`Failed to email the new password to ${to}: ${error.message}`);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
function escapeHtml(value) {
    const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    return value.replace(/[&<>"']/g, (c) => entities[c]);
}
//# sourceMappingURL=mail.service.js.map