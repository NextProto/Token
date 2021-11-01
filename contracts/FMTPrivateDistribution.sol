// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./BokkyPooBahsDateTimeLibrary.sol";

contract FMTPrivateDistribution is Ownable {
    event InvestorsAdded(
        address[] investors,
        uint256[] tokenAllocations,
        address caller
    );

    event InvestorAdded(
        address indexed investor,
        address indexed caller,
        uint256 allocation
    );

    event InvestorRemoved(
        address indexed investor,
        address indexed caller,
        uint256 allocation
    );

    event WithdrawnTokens(address indexed investor, uint256 value);

    event DepositInvestment(address indexed investor, uint256 value);

    event TransferInvestment(address indexed owner, uint256 value);

    event RecoverToken(address indexed token, uint256 indexed amount);

    uint256 private constant _remainingDistroPercentage = 75;
    uint256 private constant _noOfRemaingDays = 270;

    IERC20 private _fmtToken;
    uint256 private _totalAllocatedAmount;
    uint256 private _initialTimestamp;
    address[] public investors;

    struct Investor {
        bool exists;
        uint256 withdrawnTokens;
        uint256 tokensAllotment;
    }

    mapping(address => Investor) public investorsInfo;

    /// @dev Boolean variable that indicates whether the contract was initialized.
    bool public isInitialized = false;
    /// @dev Boolean variable that indicates whether the investors set was finalized.
    bool public isFinalized = false;

    /// @dev Checks that the contract is initialized.
    modifier initialized() {
        require(isInitialized, "not initialized");
        _;
    }

    /// @dev Checks that the contract is initialized.
    modifier notInitialized() {
        require(!isInitialized, "initialized");
        _;
    }

    modifier onlyInvestor() {
        require(investorsInfo[_msgSender()].exists, "Only investors allowed");
        _;
    }

    constructor(address _token) {
        _fmtToken = IERC20(_token);
    }

    function getInitialTimestamp() public view returns (uint256 timestamp) {
        return _initialTimestamp;
    }

    /// @dev release tokens to all the investors
    function releaseTokens() external onlyOwner initialized {
        for (uint8 i = 0; i < investors.length; i++) {
            Investor storage investor = investorsInfo[investors[i]];
            uint256 tokensAvailable = withdrawableTokens(investors[i]);
            if (tokensAvailable > 0) {
                investor.withdrawnTokens =
                    investor.withdrawnTokens +
                    tokensAvailable;
                _fmtToken.transfer(investors[i], tokensAvailable);
            }
        }
    }

    /// @dev Adds investors. This function doesn't limit max gas consumption,
    /// so adding too many investors can cause it to reach the out-of-gas error.
    /// @param _investors The addresses of new investors.
    /// @param _tokenAllocations The amounts of the tokens that belong to each investor.
    function addInvestors(
        address[] calldata _investors,
        uint256[] calldata _tokenAllocations
    ) external onlyOwner {
        require(
            _investors.length == _tokenAllocations.length,
            "different arrays sizes"
        );
        for (uint256 i = 0; i < _investors.length; i++) {
            _addInvestor(_investors[i], _tokenAllocations[i]);
        }
        emit InvestorsAdded(_investors, _tokenAllocations, msg.sender);
    }

    // 25% at TGE, 75% released daily over 270 Days, no Cliff
    function withdrawTokens() external onlyInvestor initialized {
        Investor storage investor = investorsInfo[_msgSender()];

        uint256 tokensAvailable = withdrawableTokens(_msgSender());

        require(tokensAvailable > 0, "no tokens available to withdraw.");

        investor.withdrawnTokens = investor.withdrawnTokens + tokensAvailable;
        _fmtToken.transfer(_msgSender(), tokensAvailable);

        emit WithdrawnTokens(_msgSender(), tokensAvailable);
    }

    /// @dev The starting time of TGE
    /// @param _timestamp The initial timestamp, this timestap should be used for vesting
    function setInitialTimestamp(uint256 _timestamp)
        external
        onlyOwner
        notInitialized
    {
        isInitialized = true;
        _initialTimestamp = _timestamp;
    }

    /// @dev withdrawble tokens for an address
    /// @param _investor whitelisted investor address
    function withdrawableTokens(address _investor)
        public
        view
        returns (uint256 tokens)
    {
        if (!isInitialized) {
            return 0;
        }
        Investor storage investor = investorsInfo[_investor];
        uint256 availablePercentage = _calculateAvailablePercentage();
        uint256 noOfTokens = _calculatePercentage(
            investor.tokensAllotment,
            availablePercentage
        );
        uint256 tokensAvailable = noOfTokens - investor.withdrawnTokens;

        return tokensAvailable;
    }

    /// @dev Adds investor. This function doesn't limit max gas consumption,
    /// so adding too many investors can cause it to reach the out-of-gas error.
    /// @param _investor The addresses of new investors.
    /// @param _tokensAllotment The amounts of the tokens that belong to each investor.
    function _addInvestor(address _investor, uint256 _tokensAllotment)
        internal
        onlyOwner
    {
        require(_investor != address(0), "Invalid address");
        require(
            _tokensAllotment > 0,
            "the investor allocation must be more than 0"
        );
        Investor storage investor = investorsInfo[_investor];

        require(investor.tokensAllotment == 0, "investor already added");

        investor.tokensAllotment = _tokensAllotment;
        investor.exists = true;
        investors.push(_investor);
        _totalAllocatedAmount = _totalAllocatedAmount + _tokensAllotment;
        emit InvestorAdded(_investor, _msgSender(), _tokensAllotment);
    }

    /// @dev calculate percentage value from amount
    /// @param _amount amount input to find the percentage
    /// @param _percentage percentage for an amount
    function _calculatePercentage(uint256 _amount, uint256 _percentage)
        private
        pure
        returns (uint256 percentage)
    {
        return ((_amount * _percentage) / 100) / 1e18;
    }

    function _calculateAvailablePercentage()
        private
        view
        returns (uint256 availablePercentage)
    {
        // 2,680,000 FMT assigned
        // 670,000 tokens on TGE - 25% on TGE
        // 2,010,000 tokens distributed for 270 days - 75% remaining
        // 2,010,000/270 = 7,444.4444 tokens per day
        // 75/270 = 0.2778% every day released
        uint256 oneDays = _initialTimestamp + 1 days;
        uint256 vestingDuration = _initialTimestamp + 270 days;

        uint256 everyDayReleasePercentage = (_remainingDistroPercentage *
            1e18) / _noOfRemaingDays;

        uint256 currentTimeStamp = block.timestamp;

        if (currentTimeStamp > _initialTimestamp) {
            if (currentTimeStamp <= oneDays) {
                return uint256(25) * 1e18;
            } else if (
                currentTimeStamp > oneDays && currentTimeStamp < vestingDuration
            ) {
                uint256 noOfDays = BokkyPooBahsDateTimeLibrary.diffDays(
                    _initialTimestamp,
                    currentTimeStamp
                );
                uint256 currentUnlockedPercentage = noOfDays *
                    everyDayReleasePercentage;

                return (uint256(25) * 1e18) + currentUnlockedPercentage;
            } else {
                return uint256(100) * 1e18;
            }
        }
    }

    function recoverToken(address _token, uint256 amount) external onlyOwner {
        IERC20(_token).transfer(_msgSender(), amount);
        emit RecoverToken(_token, amount);
    }
}
