import si from 'systeminformation';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Gathers and formats system health information.
 */
const getSystemHealth = async () => {
  const [cpuLoad, memory, os, time] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.osInfo(),
    si.time(),
  ]);

  return {
    os: {
      platform: os.platform,
      distro: os.distro,
      release: os.release,
    },
    cpu: {
      currentLoad: `${cpuLoad.currentLoad.toFixed(2)}%`,
      cores: cpuLoad.cpus.length,
    },
    memory: {
      total: `${(memory.total / 1024 ** 3).toFixed(2)} GB`,
      used: `${(memory.used / 1024 ** 3).toFixed(2)} GB`,
      free: `${(memory.free / 1024 ** 3).toFixed(2)} GB`,
    },
    system: {
      uptime: `${(time.uptime / 3600).toFixed(2)} hours`,
      timezone: time.timezoneName,
    },
  };
};

/**
 * @desc Controller to check system health
 * @route GET /api/v1/health
 * @access Public
 */
export const checkHealth = async (req, res) => {
  const healthData = await getSystemHealth();
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, healthData, 'System health retrieved successfully'));
};
