const mongoose = require('mongoose');

const auditReportSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  lighthouseScore: Number,
  performanceScore: Number,
  carbonAnalysis: Object,
  resourceData: Object,
  heuristics: Object,
  greenHosting: Boolean,
  verdict: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditReport', auditReportSchema);