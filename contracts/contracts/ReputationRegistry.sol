// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IElyMarketDeals {
    function deals(uint256 id)
        external
        view
        returns (
            address customer,
            address provider,
            uint256 amount,
            uint64 deadline,
            uint64 reviewSeconds,
            uint64 reviewEnds,
            uint64 resolveBy,
            uint8 status,
            string memory title
        );
}

interface IIdentityGate {
    function isVerified(address account) external view returns (bool);
}

/// @title ReputationRegistry
/// @notice One review per finished deal, written only by the customer of that
/// deal. Optionally requires the reviewer to be a verified person, and can
/// ignore very small deals so fake reviews cost real money.
contract ReputationRegistry is Ownable {
    // Matches ElyMarketV2.Status: Released = 3, Resolved = 6.
    uint8 private constant STATUS_RELEASED = 3;
    uint8 private constant STATUS_RESOLVED = 6;
    uint256 public constant MAX_COMMENT = 280;

    struct Review {
        uint8 rating;
        uint64 postedAt;
        string comment;
    }

    IElyMarketDeals public immutable market;
    IIdentityGate public identityGate;
    uint256 public minDealAmount;

    mapping(uint256 => Review) private _reviews;
    mapping(uint256 => bool) public reviewed;
    mapping(address => uint32) public reviewCount;
    mapping(address => uint64) public ratingSum;

    event ReviewPosted(
        uint256 indexed dealId,
        address indexed provider,
        address indexed customer,
        uint8 rating,
        string comment
    );
    event IdentityGateChanged(address gate);
    event MinDealAmountChanged(uint256 amount);

    constructor(address _market) Ownable(msg.sender) {
        require(_market != address(0), "Zero address");
        market = IElyMarketDeals(_market);
    }

    function postReview(uint256 dealId, uint8 rating, string calldata comment) external {
        require(rating >= 1 && rating <= 5, "Rating 1 to 5");
        require(bytes(comment).length <= MAX_COMMENT, "Comment too long");
        require(!reviewed[dealId], "Already reviewed");

        (
            address customer,
            address provider,
            uint256 amount,
            ,
            ,
            ,
            ,
            uint8 status,

        ) = market.deals(dealId);

        require(msg.sender == customer, "Not the customer");
        require(
            status == STATUS_RELEASED || status == STATUS_RESOLVED,
            "Deal not finished"
        );
        require(amount >= minDealAmount, "Deal too small");
        if (address(identityGate) != address(0)) {
            require(identityGate.isVerified(msg.sender), "Not verified");
        }

        reviewed[dealId] = true;
        _reviews[dealId] = Review({
            rating: rating,
            postedAt: uint64(block.timestamp),
            comment: comment
        });
        reviewCount[provider] += 1;
        ratingSum[provider] += rating;

        emit ReviewPosted(dealId, provider, customer, rating, comment);
    }

    function getReview(uint256 dealId) external view returns (Review memory) {
        return _reviews[dealId];
    }

    /// @notice Average rating times 100, so 450 means 4.5 stars. Zero if none.
    function averageRatingX100(address provider) external view returns (uint256) {
        uint32 count = reviewCount[provider];
        if (count == 0) return 0;
        return (uint256(ratingSum[provider]) * 100) / count;
    }

    /// @notice Use the zero address to switch the identity requirement off.
    function setIdentityGate(address gate) external onlyOwner {
        require(gate == address(0) || gate.code.length > 0, "Not a contract");
        identityGate = IIdentityGate(gate);
        emit IdentityGateChanged(gate);
    }

    function setMinDealAmount(uint256 amount) external onlyOwner {
        minDealAmount = amount;
        emit MinDealAmountChanged(amount);
    }
}