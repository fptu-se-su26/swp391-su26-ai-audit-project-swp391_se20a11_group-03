package com.auction.event.enums;

/**
 * How bids in an event are backed financially.
 *
 * <ul>
 *   <li>{@code REAL} — bids lock real wallet money while leading (like a TIMED
 *       auction); no registration deposit.</li>
 *   <li>{@code VIRTUAL} — bids are free "play money", but bidders must stake a
 *       real deposit when registering. The winner still pays real money to
 *       receive the goods; abandoning forfeits the deposit.</li>
 * </ul>
 */
public enum EventMoneyMode {
    REAL,
    VIRTUAL
}
