"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function fixRiskScores() {
    return __awaiter(this, void 0, void 0, function () {
        var brokenReports, _i, brokenReports_1, report, riskScores, totalRiskScore, calculatedOverallRiskScore, extremeCount, highCount, mediumCount, calculatedOverallRiskLevel, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, 7, 9]);
                    console.log('🔧 Starting risk score recalculation for existing reports...');
                    return [4 /*yield*/, prisma.report.findMany({
                            where: {
                                OR: [
                                    { overallRiskScore: 0 },
                                    { overallRiskScore: null }
                                ]
                            },
                            include: {
                                assessments: true
                            }
                        })];
                case 1:
                    brokenReports = _a.sent();
                    console.log("\uD83D\uDCCA Found ".concat(brokenReports.length, " reports with broken risk scores"));
                    _i = 0, brokenReports_1 = brokenReports;
                    _a.label = 2;
                case 2:
                    if (!(_i < brokenReports_1.length)) return [3 /*break*/, 5];
                    report = brokenReports_1[_i];
                    if (report.assessments.length === 0) {
                        console.log("\u26A0\uFE0F Skipping report ".concat(report.id, " (").concat(report.fileName, ") - no assessments found"));
                        return [3 /*break*/, 4];
                    }
                    riskScores = report.assessments.map(function (assessment) { return assessment.riskScore; });
                    totalRiskScore = riskScores.reduce(function (sum, score) { return sum + score; }, 0);
                    calculatedOverallRiskScore = Math.round((totalRiskScore / riskScores.length) * 10) / 10;
                    extremeCount = report.assessments.filter(function (a) { return a.riskLevel === 'extreme'; }).length;
                    highCount = report.assessments.filter(function (a) { return a.riskLevel === 'high'; }).length;
                    mediumCount = report.assessments.filter(function (a) { return a.riskLevel === 'medium'; }).length;
                    calculatedOverallRiskLevel = 'low';
                    if (extremeCount > 0 || calculatedOverallRiskScore >= 20) {
                        calculatedOverallRiskLevel = 'extreme';
                    }
                    else if (highCount > 0 || calculatedOverallRiskScore >= 15) {
                        calculatedOverallRiskLevel = 'high';
                    }
                    else if (mediumCount > 0 || calculatedOverallRiskScore >= 10) {
                        calculatedOverallRiskLevel = 'medium';
                    }
                    // Update the report with calculated values
                    return [4 /*yield*/, prisma.report.update({
                            where: { id: report.id },
                            data: {
                                overallRiskScore: calculatedOverallRiskScore,
                                overallRiskLevel: calculatedOverallRiskLevel
                            }
                        })];
                case 3:
                    // Update the report with calculated values
                    _a.sent();
                    console.log("\u2705 Fixed report ".concat(report.id, " (").concat(report.fileName, "): ").concat(calculatedOverallRiskScore, "/25 (").concat(calculatedOverallRiskLevel, ") - ").concat(report.assessments.length, " assessments"));
                    console.log("   Risk distribution - Extreme: ".concat(extremeCount, ", High: ").concat(highCount, ", Medium: ").concat(mediumCount, ", Low: ").concat(report.assessments.length - extremeCount - highCount - mediumCount));
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("\uD83C\uDF89 Successfully recalculated risk scores for ".concat(brokenReports.length, " reports"));
                    return [3 /*break*/, 9];
                case 6:
                    error_1 = _a.sent();
                    console.error('❌ Error fixing risk scores:', error_1);
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, prisma.$disconnect()];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
fixRiskScores();
