const Contracts = {};

Contracts.execute = async (contract, functionName, args, weiSent, wallet) => {
    try {
        const connectedContract = await contract.connect(wallet);
        const payload = weiSent ? { value: weiSent } : undefined; // Ensure payload is only created if weiSent is provided
        const response = payload ? await connectedContract[functionName](...args, payload) : await connectedContract[functionName](...args);

        // For view functions, no events are emitted, thus no need to wait for a transaction receipt
        if (!response.wait)
            return { ok: true, view: true, result: response };

        const receipt = await response.wait();
        const events = [];
        receipt.logs.forEach(log => {
            try {
                const parsedLog = contract.interface.parseLog(log);
                console.log("Event emitted:", parsedLog.name, parsedLog.args); // Log each event
                events.push({ name: parsedLog.name, args: parsedLog.args });
            } catch (e) {
                // If log parsing fails, it might be due to logs not matching any known event, which is fine
            }
        });

        return { ok: true, view: false, events };
    } catch (e) {
        console.error("Error during contract execution or event logging:", e);
        return { ok: false, message: e.message || "An unknown error occurred" };
    }
};

module.exports = { Contracts };
