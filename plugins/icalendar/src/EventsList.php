<?php

namespace om;

use ArrayObject;

/**
 * Copyright (c) 2004-2022 Roman Ožana (https://ozana.cz)
 *
 * @license BSD-3-Clause
 * @author Roman Ožana <roman@ozana.cz>
 */
class EventsList extends ArrayObject {

    /**
     * Return array of Events
     *
     * @return array
     */
    public function getArrayCopy(): array {
        return array_values(parent::getArrayCopy());
    }

    /**
     * Return sorted EventList (the newest dates are first)
     *
     * @return $this
     */
    public function sorted(): EventsList {
        $this->uasort(static function ($a, $b): int {
            if ($a['DTSTART'] === $b['DTSTART']) {
                return 0;
            }
            return ($a['DTSTART'] < $b['DTSTART']) ? -1 : 1;
        });

        return $this;
    }

    /**
     * Return reversed sorted EventList (the oldest dates are first)
     *
     * @return $this
     */
    public function reversed(): EventsList {
        $this->uasort(static function ($a, $b): int {
            if ($a['DTSTART'] === $b['DTSTART']) {
                return 0;
            }
            return ($a['DTSTART'] > $b['DTSTART']) ? -1 : 1;
        });

        return $this;
    }

    /**
     * Combine two EventsList instances into a new one
     *
     * @param EventsList $otherList
     * @return EventsList
     */
    public function combine(EventsList $otherList): EventsList {
        // Create a new EventsList to store the combined events
        $combinedList = new EventsList();

        // Add all events from the current list
        foreach ($this as $event) {
            $combinedList->append($event);
        }

        // Add all events from the other list
        foreach ($otherList as $event) {
            $combinedList->append($event);
        }

        return $combinedList;
    }

}